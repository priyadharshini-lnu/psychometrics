# frozen_string_literal: true

module CampaignUsers
  class BeginCampaign < BaseCommand
    private_attr_reader :campaign_user, :campaign
    attr_accessor :jwt_token

    def initialize(campaign_user)
      @campaign_user = campaign_user
      @campaign = campaign_user.campaign
    end

    def call
      campaign_user.update(attributes)

      broadcast :ok
    end

    private

    def attributes
      {
        started_at: Time.zone.now,
        status: :in_progress,
        expiry_date: campaign_user.compute_expiry_date
      }
    end
  end
end
