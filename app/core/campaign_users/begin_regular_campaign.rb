# frozen_string_literal: true

module CampaignUsers
  class BeginRegularCampaign < BaseCommand
    private_attr_reader :campaign_user, :campaign

    def initialize(campaign_user)
      @campaign_user = campaign_user
      @campaign = campaign_user.campaign
    end

    def call
      campaign_user.update_attributes(attributes)

      broadcast :ok
    end

    private

    def attributes
      {
        started_at: Time.now,
        status: :in_progress,
        expiry_date: campaign.fixed_time? ? campaign.fixed_time_duration&.seconds&.from_now : nil
      }
    end
  end
end
