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
        ::CampaignFactorValue.joins(:campaign_factor).where(campaign: campaign, user: user).
          where.not(campaign_factors: { factor_type: :assessor_scoring }).destroy_all
        campaign_user.update!(campaign_scores_finalized: false, campaign_scores_finalized_date: nil)
        score_values = ::CampaignScoring::CalculateAndSave.call!(campaign, user)
        campaign_user.reload.generate_or_remove_report_on_score_finalized
        score_values
      end

      broadcast :ok, campaign_factor_values
    end
  end
end
