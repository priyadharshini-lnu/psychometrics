# frozen_string_literal: true

module Threesixty
  class EvaluationsController < ApplicationController
    include ::Threesixty::InitialState
    include ::Threesixty::SetAssessmentLocale

    layout 'layouts/end_user'
    before_action :set_campaign
    before_action :set_evaluation, except: [:deny]
    initial_state_for [:show]

    def show
      params[:approve_evaluation] ? authorize(@participant, :approve_evaluation?) : authorize(@participant)
      respond_to do |format|
        format.html { render 'end_user/users/dashboard' }
        format.json do
          @users_result = find_user_result_or_create
          set_locale_for_user_assessment(@participant)
          if params[:is_edit] == 'true'
            render(json: { error: '403' }, status: 403) && return unless policy(@participant).edit?

            ::UserAssessments::ResetProgress.call!(@participant)
          end

          set_read_results if params[:is_read] == 'true'

          render json: UsersResultSerializer.new(
            context: {
              participant: @participant, campaign: @campaign,
              current_user: current_user, locale: @selected_locale,
              piped_text_context: get_piped_text_context,
              read_only: params[:is_read] == 'true',
              include: '**'
            }
          ).serialize(@users_result)
        end
      end
    end

    def decline
      authorize @participant
      @participant = @campaign.participants.find_by!(
        evaluator_id: current_user.id,
        id: params[:evaluation_id] || params[:id]
      )

      @participant.update!(evaluator_nomination_status: :declined)

      ::Threesixty::Emails::Send.call!(
        ::Threesixty::Emails::Name::NOMINATION_DENIED,
        threesixty_campaign: @campaign,
        subject: @participant.threesixty_subject,
        evaluator: @participant.threesixty_evaluator,
        mail_config: { condition_class: Threesixty::Emails::IsDeclinedNominationSendable }
      )

      render json: @participant, serializer: Threesixty::EndUser::ParticipantSerializer, include: '**'
    end

    def update_status
      authorize @participant
      @participant.update(manager_evaluation_status: params[:status])
      render json: @participant, serializer: Threesixty::EndUser::ParticipantSerializer, include: '**'
    end

    private

    def find_user_result_or_create
      unless @participant.users_result
        @participant.update(
          expiry_date: @campaign.assessment.extra['timer']&.second&.from_now,
          last_activity_at: DateTime.current,
          started_at: DateTime.current,
          status: :in_progress
        )
        @participant.create_users_result(answers: {})
      end
      @participant.users_result
    end

    def set_read_results
      @participant.status = :in_progress
      @users_result.current_element = nil
      @users_result.current_page = 0
    end

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id])
    end

    def set_evaluation
      @participant = @campaign.participants.find(params[:evaluation_id] || params[:id])
    end

    def get_piped_text_context
      {
        evaluator: @users_result.evaluator,
        subject: @users_result.subject,
        threesixty_campaign: @campaign,
        result: @users_result
      }
    end
  end
end
