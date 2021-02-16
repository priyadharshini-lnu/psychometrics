# frozen_string_literal: true

module CampaignUsers
  class BeginRegularCampaign < BaseCommand
    private_attr_reader :campaign_user

    def initialize(campaign_user)
      @campaign_user = campaign_user
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
        expiry_date: campaign_user.campaign.fixed_time_duration&.minutes&.from_now
      }
    end
  end
end
