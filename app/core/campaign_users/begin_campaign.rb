# frozen_string_literal: true

module CampaignUsers
  class BeginCampaign < BaseCommand
    private_attr_reader :campaign_user

    def initialize(campaign_user)
      @campaign_user = campaign_user
    end

    def call
      broadcast :invalid unless campaign_user

      transaction do
        campaign_user.update_attributes(attributes)
      end

      broadcast :ok
    end

    private

    def attributes
      {
        completion_status: 1,
        started_at: Time.now
      }
    end
  end
end
