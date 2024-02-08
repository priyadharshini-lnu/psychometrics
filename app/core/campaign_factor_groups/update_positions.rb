# frozen_string_literal: true

module CampaignFactorGroups
  class UpdatePositions < BaseCommand
    private_attr_reader :campaign, :params

    def initialize(campaign, params)
      @campaign = campaign
      @params = params
    end

    def call
      transaction do
        params.each do |group_params|
          campaign.
            campaign_factor_groups.
            find(group_params['id']).
            update(position: group_params['attributes']['position'])
        end
      end
      broadcast :ok, campaign.campaign_factor_groups
    rescue StandardError => e
      broadcast :error, [{ base: e.message }]
    end
  end
end
