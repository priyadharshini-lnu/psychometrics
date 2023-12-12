# frozen_string_literal: true

module Api
  class V2::Administration::CampaignFactorGroupsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::CampaignFactorGroup::Schema

    def initialize_scoring
      result = ::CampaignFactorGroups::InitializeScoring.call(campaign)
      if result[:ok]
        jsonapi_render json: result[:ok]
      else
        jsonapi_render_errors [{ code: result[:error] }], status: :unprocessable_entity
      end
    end

    def update_positions
      groups = params[:data][:attributes]
      result = ::CampaignFactorGroups::UpdatePositions.call(campaign, groups)
      if result[:ok]
        jsonapi_render json: result[:ok]
      else
        jsonapi_render_errors [{ code: result[:error] }], status: :unprocessable_entity
      end
    end
  end
end
