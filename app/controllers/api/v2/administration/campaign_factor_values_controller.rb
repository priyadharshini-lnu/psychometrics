# frozen_string_literal: true

module Api
  class V2::Administration::CampaignFactorValuesController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::CampaignFactorValue::Schema

    def save_assessor_scoring_factor_value
      audit! :save_assessor_scoring_factor_value, campaign, payload: params[:data][:attributes], campaign: campaign

      ::CampaignFactors::SaveAssessorScoringFactorValue.call!(campaign, params[:data][:attributes], current_user) do
        on(:ok) do
          next unless manually_moderated_assessor_scoring_factors_exist?

          user = User.find_by(id: params[:user_id])

          audit! :campaign_scoring_rescore, user, payload: {}, campaign: campaign
          ::CampaignScoring::Rescore.call!(campaign, user)
        end
        on(:error) { |error| return render json: { error: error }, status: :bad_request }
      end

      render json: :ok
    end

    private

    def manually_moderated_assessor_scoring_factors_exist?
      campaign.campaign_factors.where(factor_type: :assessor_scoring).manually_moderated.exists?
    end
  end
end
