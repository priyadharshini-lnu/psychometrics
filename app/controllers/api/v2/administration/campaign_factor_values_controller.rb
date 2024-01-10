# frozen_string_literal: true

module Api
  class V2::Administration::CampaignFactorValuesController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::CampaignFactorValue::Schema

    def save_assessor_scoring_factor_value
      ::CampaignFactors::SaveAssessorScoringFactorValue.call!(campaign, params[:data][:attributes], current_user)

      head :ok
    end
  end
end
