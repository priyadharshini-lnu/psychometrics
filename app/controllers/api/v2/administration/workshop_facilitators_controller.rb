# frozen_string_literal: true

module Api
  class V2::Administration::WorkshopFacilitatorsController < Api::V2::Administration::BaseController
    before_action :check_search_term, only: %i[search_managers search_assessors]

    def search_managers
      users = Workshops::AvailableManagers.new(
        Time.zone.parse(search_params[:start_date_time]),
        Time.zone.parse(search_params[:end_date_time]),
        search_params[:campaign_id],
        search_term: search_params[:search_term]
      ).query

      jsonapi_render json: users
    end

    def search_assessors
      users = Workshops::AvailableAssessors.new(
        Time.zone.parse(search_params[:start_date_time]),
        Time.zone.parse(search_params[:end_date_time]),
        search_term: search_params[:search_term]
      ).query

      jsonapi_render json: users
    end

    def pundit_authorize
      authorize(
        nil,
        nil,
        policy_class: Api::Administration::WorkshopFacilitatorPolicy,
        project_id: project_id || search_params[:client_id],
        campaign_id: campaign_id
      )
    end

    def check_search_term
      jsonapi_render json: User.none if search_params[:search_term].blank?
    end

    def search_params
      params.permit(%i[start_date_time end_date_time campaign_id search_term project_id client_id])
    end
  end
end
