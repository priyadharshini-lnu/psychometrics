# frozen_string_literal: true

module CampaignFactorGroups
  class UpdatePositions < BaseCommand
    private_attr_reader :campaign, :groups

    def initialize(campaign, groups)
      @campaign = campaign
      @groups = groups
    end

    def call
      transaction do
        groups.each do |group|
          campaign.campaign_factor_groups.find(group['id']).update(position: group['position'])
        end
      end
      broadcast :ok, campaign.campaign_factor_groups
    rescue StandardError => e
      broadcast :error, [{ base: e.message }]
    end
  end
end
