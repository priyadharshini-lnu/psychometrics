# frozen_string_literal: true

module Threesixty
  class NominationsController < ApplicationController
    include ::Threesixty::InitialState
    layout 'layouts/threesixty_campaign'
    before_action :set_campaign
    before_action :set_subject
    initial_state_for [:show]

    def show
      authorize @subject
      respond_to do |format|
        format.html { render 'threesixty/campaigns/show' }
        format.json do
          render json: @subject, serializer: Threesixty::NominationSerializer, include: '**'
        end
      end
    end

    def search_evaluators
      render json: Threesixty::Evaluators::SearchQuery.
        new(@campaign.campaign, @subject, params[:q]).query, each_serializer: ::Projects::SearchUserSerializer
    end

    def request_approval
      Threesixty::Emails::Send.
        call!(Threesixty::Emails::Name::REQUEST_APPROVAL, threesixty_campaign: @campaign, subject: @subject)
      render json: :ok
    end

    def send_evaluator_reminders
      Threesixty::Emails::Send.
        call!(Threesixty::Emails::Name::EVALUATOR_REMINDER, threesixty_campaign: @campaign, subject: @subject)
      render json: :ok
    end

    def update_status
      if params[:status] == 'denied'
        participants = @subject.participants.where(manager_nomination_status: :waiting)
        participants.each { |participant| send_nomination_denied_email(participant) }
        participants.update_all(manager_nomination_status: :denied)
      else
        @campaign.participants.where(manager_nomination_status: :waiting).
          update_all(manager_nomination_status: params[:status])
      end

      render json: @subject, serializer: Threesixty::NominationSerializer, include: '**'
    end

    private

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id])
    end

    def set_subject
      @subject = @campaign.subjects.find(params[:nomination_id] || params[:id])
    end

    def send_nomination_denied_email(participant)
      ::Threesixty::Emails::Send.call!(
        ::Threesixty::Emails::Name::NOMINATION_DENIED,
        threesixty_campaign: @campaign,
        subject: participant.threesixty_subject,
        evaluator: participant.threesixty_evaluator
      )
    end
  end
end
