# frozen_string_literal: true

module CampaignUsers
  class Results < BaseCommand
    attr_accessor :campaign_user

    def initialize(campaign_user)
      @campaign_user = campaign_user
    end

    def call
      campaign_factor_values = CampaignFactorValue.where(
        campaign_id: campaign_user.campaign_id, user_id: campaign_user.user_id
      )
      results = campaign_factor_values.includes(:campaign_factor).map do |factor_value|
        {
          id: factor_value.campaign_factor.code,
          name: factor_value.campaign_factor.name,
          value: factor_value.value,
          value_type: factor_value.campaign_factor.output_type
        }
      end
      broadcast :ok, results
    end
  end
end
