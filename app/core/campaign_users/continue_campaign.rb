# frozen_string_literal: true

module CampaignUsers
  class ContinueCampaign < BaseCommand
    private_attr_reader :campaign_user

    def initialize(campaign_user)
      @campaign_user = campaign_user
    end

    def call
      campaign_user.update(attributes) if can_continue?

      broadcast :ok
    end

    private

    def attributes
      {
        started_at: campaign_user.started_at || Time.zone.now,
        status: :in_progress,
        completed_at: nil,
        expiry_date: campaign_user.compute_expiry_date,
        additional_time: nil
      }
    end

    def can_continue?
      campaign_user.interrupted_campaign? || has_no_expiry_date_for_fixed_time_campaign?
    end

    def has_no_expiry_date_for_fixed_time_campaign?
      campaign_user.campaign.fixed_time? && campaign_user.expiry_date.nil?
    end
  end
end
