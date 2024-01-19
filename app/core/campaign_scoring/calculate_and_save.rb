# frozen_string_literal: true

module CampaignScoring
  class CalculateAndSave < BaseCommand
    private_attr_reader :campaign, :user, :campaign_user, :existing_campaign_factor_values

    def initialize(campaign, user)
      @campaign = campaign
      @user = user
      @campaign_user = campaign.campaign_users.find_by(user_id: user.id)
      @existing_campaign_factor_values =
        campaign.campaign_factor_values.where(user_id: user.id).index_by(&:campaign_factor_id)
    end

    def call
      return broadcast :campaign_scores_unchanged if campaign_user.campaign_scores_finalized?

      indexed_factor_values = CampaignScoring::Calculate.call!(campaign, user)
      campaign_factor_values = indexed_factor_values.flat_map do |cf, factor_value|
        next if factor_value.error? || factor_value.value.nil?
        next existing_campaign_factor_values[cf.id] if existing_campaign_factor_values[cf.id]&.value

        campaign_factor_value = existing_campaign_factor_values[cf.id] ||
                                cf.campaign_factor_values.new(user_id: user.id, campaign_id: campaign.id)

        campaign_factor_value.value = factor_value.value
        campaign_factor_value.save!
        campaign_factor_value
      end
      campaign_user.update!(campaign_scores_finalized: true) if campaign_user.all_campaign_scores_present?

      broadcast :ok, campaign_factor_values, indexed_factor_values
    end
  end
end
