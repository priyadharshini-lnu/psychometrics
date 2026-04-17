# frozen_string_literal: true

module CampaignFactors
  class SaveAssessorScoringFactorValue < BaseCommand
    private_attr_reader :campaign, :params, :current_user

    def initialize(campaign, params, current_user)
      @campaign = campaign
      @params = params
      @current_user = current_user
    end

    def call
      lead_assessor = Users::GetLeadAssessor.call!(campaign, User.find(params[:user_id]))

      unless current_user.id == lead_assessor&.id
        raise Pundit::NotAuthorizedError, 'You are not authorized to perform this action'
      end

      transaction do
        valid_factor_ids = fetch_valid_assessor_scoring_factor_ids
        params[:scores].each do |score|
          next unless valid_factor_ids.include?(score[:campaign_factor_id].to_i)

          factor_value = campaign.campaign_factor_values.find_or_create_by(
            campaign_factor_id: score[:campaign_factor_id],
            user_id: params[:user_id]
          )

          factor_value.update(numeric_value: score[:score], calculation_type: :manual)
        end
      end

      broadcast :ok
    end

    private

    def fetch_valid_assessor_scoring_factor_ids
      score_factor_ids = params[:scores].pluck(:campaign_factor_id)
      CampaignFactor.where(id: score_factor_ids, factor_type: :assessor_scoring).pluck(:id).to_a
    end
  end
end
