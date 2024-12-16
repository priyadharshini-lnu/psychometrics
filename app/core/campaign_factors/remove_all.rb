# frozen_string_literal: true

module CampaignFactors
  class RemoveAll < BaseCommand
    private_attr_accessor :campaign

    def initialize(campaign)
      @campaign = campaign
    end

    def call
      campaign.transaction do
        campaign_factors_without_manual_scores.destroy_all
        empty_campaign_factor_groups.destroy_all
      end

      broadcast :ok, campaign
    rescue StandardError => e
      Rails.logger.error("Reset failed: #{e.message}")
      broadcast :error, [e.message]
    end

    private

    def campaign_factors_without_manual_scores
      manual_factor_ids = campaign.campaign_factors.
                          joins(:campaign_factor_values).
                          where(campaign_factor_values: { calculation_type: 'manual' }).
                          select('DISTINCT campaign_factors.id').
                          pluck(:id)

      campaign.campaign_factors.where.not(id: manual_factor_ids)
    end

    def empty_campaign_factor_groups
      campaign.campaign_factor_groups.where.not(
        id: campaign.campaign_factors.pluck(:campaign_factor_group_id)
      )
    end

    def campaign_factors
      @campaign_factors ||= campaign.campaign_factors
    end
  end
end
