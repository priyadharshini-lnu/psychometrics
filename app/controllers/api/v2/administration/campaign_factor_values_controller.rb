# frozen_string_literal: true

module Api
  class V2::Administration::CampaignFactorValuesController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::CampaignFactorValue::Schema

    def save_assessor_scoring_factor_value
      audit! :save_assessor_scoring_factor_value, campaign, payload: params[:data][:attributes], campaign: campaign

      ::CampaignFactors::SaveAssessorScoringFactorValue.call!(campaign, params[:data][:attributes], current_user) do
        on(:ok) do
          user = User.find_by(id: params[:user_id])

          audit! :campaign_scoring_rescore, user, payload: {}, campaign: campaign
          ::CampaignScoring::Rescore.call!(campaign, user)
        end
      end

      head :ok
    end
  end
end
