# frozen_string_literal: true

module Api
  class V2::Administration::Projects::CampaignsController < Api::V2::Administration::BaseController
    private

    def policy_class
      Api::Administration::ProjectBulkReportPolicy
    end

    def base_response_meta
      return {} if params[:action] != 'index'

      {
        available_tags: Api::V2::Administration::Projects::CampaignResource.available_tags(
          project_id: params[:project_id]
        )
      }
    end
  end
end
