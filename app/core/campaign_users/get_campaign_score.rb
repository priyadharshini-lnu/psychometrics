# frozen_string_literal: true

module CampaignUsers
  class GetCampaignScore < BaseCommand
    attr_accessor :campaign, :user, :only_campaign_factor_codes

    def initialize(campaign, user, only_campaign_factor_codes = nil)
      @campaign = campaign
      @user = user
      @only_campaign_factor_codes = only_campaign_factor_codes || campaign.campaign_factors.pluck(:code)
    end

    def call
      scores = CampaignFactorValue.includes(:campaign_factor).
               where(user_id: user.id, campaign_id: campaign.id).
               where(campaign_factors: { code: only_campaign_factor_codes }).
               find_each.with_object({}) do |factor_value, score|
        score[factor_value.campaign_factor] = factor_value.value
      end
      broadcast :ok, scores
    end
  end
end
