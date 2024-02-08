# frozen_string_literal: true

module CampaignFactorGroups
  class InitializeScoring < BaseCommand
    private_attr_reader :campaign

    def initialize(campaign)
      @campaign = campaign
    end

    def call
      return if campaign.campaign_factor_groups.find_by(name: CampaignFactorGroup::DEFAULT_GROUP_NAME)

      transaction do
        campaign_factor_group = CampaignFactorGroup.create(
          name: CampaignFactorGroup::DEFAULT_GROUP_NAME,
          campaign_id: campaign.id
        )

        CampaignFactor.insert_all(
          Campaigns::AssessorFactor.new(campaign.id, campaign_factor_group.id).query
        )
      end

      broadcast :ok, CampaignFactorGroup.where(name: CampaignFactorGroup::DEFAULT_GROUP_NAME).first
    rescue StandardError => e
      broadcast :error, [{ base: e.message }]
    end
  end
end
