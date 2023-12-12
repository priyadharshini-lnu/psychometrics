# frozen_string_literal: true

module CampaignFactors
  class UpdatePositions < BaseCommand
    private_attr_reader :campaign, :factors

    def initialize(campaign, factors)
      @campaign = campaign
      @factors = factors
    end

    def call
      transaction do
        factors.each do |factors|
          campaign.campaign_factors.find(factors['id']).update(position: factors['position'])
        end
      end
      broadcast :ok, campaign.campaign_factors
    rescue StandardError => e
      broadcast :error, [{ base: e.message }]
    end
  end
end
