# frozen_string_literal: true

module CampaignUsers
  class ContinueCampaign < BaseCommand
    private_attr_reader :campaign_user

    def initialize(campaign_user)
      @campaign_user = campaign_user
    end

    def call
      examus_session_url = transaction do
        campaign_user.update_attributes(attributes) if campaign_user.interrupted_campaign?
        Examus::GetSessionUrl.call!(campaign_user) if campaign_user.proctoring_enabled?
      end

      broadcast :ok, { examus_session_url: examus_session_url }
    end

    private

    def attributes
      {
        status: :in_progress,
        completed_at: nil,
        expiry_date: campaign_user.additional_time&.seconds&.from_now,
        additional_time: nil
      }
    end
  end
end
