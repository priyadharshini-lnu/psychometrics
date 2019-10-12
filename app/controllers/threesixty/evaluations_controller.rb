# frozen_string_literal: true

module Threesixty
  class EvaluationsController < ApplicationController
    include ::Threesixty::InitialState
    include ::Threesixty::SetAssessmentLocale

    layout 'layouts/threesixty_campaign'
    before_action :set_campaign
    before_action :set_evaluation, except: [:deny]
    initial_state_for [:show]

    def show
      authorize @participant
      respond_to do |format|
        format.html { render 'threesixty/campaigns/show' }
        format.json do
          @users_result = UsersResult.find_or_create_by(campaign_id: @campaign.campaign_id,
                                                        subject_id: @participant.subject_id,
                                                        evaluator_id: @participant.evaluator_id) do |result|
            result.assessment_id = @campaign.assessment_id
            result.status = :in_progress
          end

          if params[:is_edit] == 'true'
            render(json: { error: '403' }, status: 403) && return unless policy(@participant).edit?
            @users_result.step = 0
          end

          @users_result.step = params[:step].to_i if params[:step]
          set_locale_for_assessment(@users_result.assessment_id)
          render json: @users_result, serializer: UsersResultSerializer,
                 participant: @participant, campaign: @campaign,
                 current_user: current_user, locale: @selected_locale,
                 piped_text_context: get_piped_text_context,
                 include: '**'
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
      @participant.update_attributes(manager_evaluation_status: params[:status])
      render json: @participant, serializer: Threesixty::EndUser::ParticipantSerializer, include: '**'
    end

    private

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
        threesixty_campaign: @campaign
      }
    end
  end
end
