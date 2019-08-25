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
        format.html {render 'threesixty/campaigns/show'}
        format.json {
          render json: @subject, serializer: Threesixty::NominationSerializer, include: '**'
        }
      end
    end

    def search_evaluators
      render json: Threesixty::Evaluators::SearchQuery.new(@campaign.campaign, @subject, params[:q]).query, each_serializer: ::Projects::SearchUserSerializer
    end

    def request_approval
      Threesixty::Emails::Send.call!(Threesixty::Emails::Name::REQUEST_APPROVAL, threesixty_campaign: @campaign, subject: @subject)
      render json: :ok
    end

    def send_evaluator_reminders
      Threesixty::Emails::Send.call!(Threesixty::Emails::Name::EVALUATOR_REMINDER, threesixty_campaign: @campaign, subject: @subject)
      render json: :ok
    end

    def update_status
      @campaign.participants.where(subject_id: @subject.user_id).update_all(manager_nomination_status: params[:status])
      render json: @subject, serializer: Threesixty::NominationSerializer, include: '**'
    end

    private

    def set_campaign
      @campaign = Threesixty::Campaign.find(params[:campaign_id])
    end

    def set_subject
      @subject = @campaign.subjects.find(params[:nomination_id] || params[:id])
    end
  end
end
