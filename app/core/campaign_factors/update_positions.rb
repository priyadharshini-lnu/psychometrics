# frozen_string_literal: true

module CampaignFactors
  class UpdatePositions < BaseCommand
    private_attr_reader :campaign, :params

    def initialize(campaign, params)
      @campaign = campaign
      @params = params
    end

    def call
      transaction do
        params.each do |factor_params|
          campaign.
            campaign_factors.
            find(factor_params['id']).
            update(position: factor_params['attributes']['position'])
        end
      end
      broadcast :ok, campaign.campaign_factors
    rescue StandardError => e
      broadcast :error, [{ base: e.message }]
    end
  end
end
