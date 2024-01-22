# frozen_string_literal: true

module CampaignScoring
  class Rescore < BaseCommand
    private_attr_reader :campaign, :user, :campaign_user

    def initialize(campaign, user)
      @campaign = campaign
      @user = user
      @campaign_user = campaign.campaign_users.find_by(user_id: user.id)
    end

    def call
      campaign_factor_values, = transaction do
        ::CampaignFactorValue.where(campaign: campaign, user: user).destroy_all
        campaign_user.update!(campaign_scores_finalized: false)
        ::CampaignScoring::CalculateAndSave.call!(campaign, user)
      end
      broadcast :ok, campaign_factor_values
    end
  end
end
