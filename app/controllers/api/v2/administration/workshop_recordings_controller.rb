# frozen_string_literal: true

module Api
  class V2::Administration::WorkshopRecordingsController < Api::V2::Administration::BaseController
    append_before_action :set_workshop, only: %i[index]
    append_before_action :pundit_authorize

    def index
      recordings = ::Workshops::ListAllRecordings.call!(@workshop, current_user)
      jsonapi_render json: recordings
    end

    def pundit_authorize
      authorize(
        @workshop,
        nil,
        policy_class: Api::Administration::WorkshopRecordingPolicy,
        project_id:  @workshop.campaign.project_id,
        campaign_id: @workshop.campaign_id
      )
    end

    def set_workshop
      @workshop = Workshop.find(params[:workshop_id])
    end
  end
end
