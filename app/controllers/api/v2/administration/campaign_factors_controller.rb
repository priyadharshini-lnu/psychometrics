# frozen_string_literal: true

module Api
  class V2::Administration::CampaignFactorsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::CampaignFactor::Schema
    validates_request_schema :create, Api::V2::CampaignFactor::Contract.new

    def update_positions
      result = ::CampaignFactors::UpdatePositions.call(campaign, params[:data])

      if result[:ok]
        jsonapi_render json: result[:ok]
      else
        jsonapi_render_errors [{ code: result[:error] }], status: :unprocessable_entity
      end
    end
  end
end
