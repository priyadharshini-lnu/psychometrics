# frozen_string_literal: true

module Api
  class V2::Administration::WorkshopFacilitatorsController < Api::V2::Administration::BaseController
    def search_managers
      users = Workshops::AvailableManagers.new(
        Time.zone.parse(params[:start_date_time]),
        Time.zone.parse(params[:end_date_time]),
        params[:campaign_id],
        search_term: params[:search_term]
      ).query

      jsonapi_render json: users
    end

    def search_assessors
      users = Workshops::AvailableAssessors.new(
        Time.zone.parse(params[:start_date_time]),
        Time.zone.parse(params[:end_date_time]),
        search_term: params[:search_term]
      ).query

      jsonapi_render json: users
    end

    def pundit_authorize
      authorize(
        nil,
        nil,
        policy_class: Api::Administration::WorkshopFacilitatorPolicy,
        project_id: project_id || params[:client_id],
        campaign_id: campaign_id
      )
    end
  end
end
