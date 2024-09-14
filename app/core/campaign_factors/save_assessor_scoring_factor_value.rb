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
        params[:scores].each do |score|
          next unless CampaignFactor.exists?(id: score[:campaign_factor_id], factor_type: :assessor_scoring)

          factor_value = campaign.campaign_factor_values.find_or_create_by(
            campaign_factor_id: score[:campaign_factor_id],
            user_id: params[:user_id]
          )

          factor_value.update(numeric_value: score[:score], calculation_type: :manual)
        end
      end

      broadcast :ok
    end
  end
end
