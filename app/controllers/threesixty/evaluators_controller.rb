# frozen_string_literal: true

module Threesixty
  class EvaluatorsController < ApplicationController
    layout 'layouts/threesixty_campaign'
    before_action :set_campaign
    before_action :set_subject
    before_action :set_nomination, only: %i[update_status update]

    def create
      authorize @subject, nil, policy_class: ::Threesixty::NominationPolicy
      form = ::Threesixty::Participants::CreateForm.from_params(params).
             with_context(subject: @subject, threesixty_campaign: @campaign)

      if form.valid?
        result = ::Threesixty::Evaluators::NominateEvaluator.call!(
          threesixty_campaign: @campaign,
          subject: @subject,
          params: params,
          nominator: current_user,
          evaluator: form.user
        )

        is_approve_nomination_sendable = Threesixty::Emails::IsApproveNominationSendable.call!(
          threesixty_campaign: @campaign
        )

        if !result.manager_nomination_approved? && is_approve_nomination_sendable
          Threesixty::Emails::Send.call!(
            Threesixty::Emails::Name::APPROVE_NOMINATION,
            threesixty_campaign: @campaign,
            subject: @subject,
            evaluator: result.threesixty_evaluator
          )
        else
          send_evaluator_invite_email(result.threesixty_evaluator)
        end
        render json: result, serializer: Threesixty::EndUser::NomineeSerializer, include: '**'
      else
        render json: { errors: form.error_messages }, status: :bad_request
      end
    end

    def update_status
      authorize @nomination, nil, policy_class: ::Threesixty::NominationPolicy
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
      authorize @nomination, nil, policy_class: ::Threesixty::NominationPolicy
      @nomination.destroy
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
