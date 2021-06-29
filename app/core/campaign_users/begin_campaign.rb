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
      examus_session_url = transaction do
        campaign_user.update_attributes(attributes)
        Examus::GetSessionUrl.call!(campaign_user) if campaign_user.proctoring_enabled?
      end

      broadcast :ok, { examus_session_url: examus_session_url }
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
