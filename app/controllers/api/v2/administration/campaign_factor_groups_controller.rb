# frozen_string_literal: true

module Api
  class V2::Administration::CampaignFactorGroupsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::CampaignFactorGroup::Schema
    validates_request_schema :create, Api::V2::CampaignFactorGroup::Contract.new
    validates_request_schema :update, Api::V2::CampaignFactorGroup::Contract.new

    def initialize_scoring
      result = ::CampaignFactorGroups::InitializeScoring.call(campaign)
      audit! :initialize_scoring, campaign, payload: {}, campaign: campaign

      if result[:ok]
        jsonapi_render json: result[:ok]
      else
        jsonapi_render_errors [{ code: result[:error] }], status: :unprocessable_entity
      end
    end

    def update_positions
      result = ::CampaignFactorGroups::UpdatePositions.call(campaign, params[:data])
      audit! :update_positions, campaign, payload: params, campaign: campaign

      if result[:ok]
        jsonapi_render json: result[:ok]
      else
        jsonapi_render_errors [{ code: result[:error] }], status: :unprocessable_entity
      end
    end
  end
end
