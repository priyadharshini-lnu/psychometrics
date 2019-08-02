module Threesixty
  class EvaluatorsController < ApplicationController
    layout 'layouts/threesixty_campaign'
    before_action :set_campaign
    before_action :set_subject
    before_action :set_nomination, only: [:update_status]

    def create
      form = ::Threesixty::Participants::CreateForm.from_params(params).
              with_context(subject: @subject, threesixty_campaign: @campaign)
      if form.valid?
        result = ::Threesixty::Evaluators::NominateEvaluator.call!(@campaign, @subject, params, form.user)

        if Threesixty::Emails::IsApproveNominationSendable.call!(threesixty_campaign: @campaign)
          Threesixty::Emails::Send.call!(
            Threesixty::Emails::Name::APPROVE_NOMINATION,
            threesixty_campaign: @campaign,
            subject: @subject
          )
        else
          send_evaluator_invite_email(@nomination.threesixty_evaluator)
        end
        render json: result, serializer: Threesixty::EndUser::NomineeSerializer, include: '**'
      else
        render json: { errors: form.error_messages }, status: :bad_request
      end
    end

    def update_status
      @nomination.update(manager_nomination_status: params[:status])
      if @nomination.manager_nomination_denied?
        Threesixty::Emails::Send.call!(
          Threesixty::Emails::Name::NOMINATION_DENIED,
          threesixty_campaign: @campaign,
          subject: @subject,
          evaluator: @nomination.threesixty_evaluator
        )
      elsif @nomination.manager_nomination_approved?
        send_evaluator_invite_email(@nomination.threesixty_evaluator)
      end
      render json: @nomination, serializer: Threesixty::EndUser::NomineeSerializer, include: '**'
    end

    def destroy
      @nomination = @subject.participants.find_by(evaluator_id: params[:id])
      @nomination.destroy
      @nomination.threesixty_subject.decrement!(:evaluators_count)
      @nomination.threesixty_evaluator.decrement!(:evaluations_count)
      render json: nil
    end

    private

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id])
    end

    def set_subject
      @subject = @campaign.subjects.find(params[:nomination_id])
    end

    def set_nomination
      @nomination = @subject.participants.find_by(id: params[:evaluator_id] || params[:id])
    end

    def evaluator_params
      params.permit(:evaluator_id, :relationship_id)
    end

    def send_evaluator_invite_email(evaluator)
      return unless @campaign.option.messages['send_invite_to_new_evaluator']
      Threesixty::Emails::Send.call!(
        Threesixty::Emails::Name::EVALUATOR_INVITE,
        threesixty_campaign: @campaign,
        subject: @subject,
        evaluator: evaluator
      )
    end
  end
end
