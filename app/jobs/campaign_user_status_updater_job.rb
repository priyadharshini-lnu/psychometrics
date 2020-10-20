# frozen_string_literal: true

class CampaignUserStatusUpdaterJob < ApplicationJob
  # Set completion status of campaign_users
  def perform
    campaigns = Campaign.visible_to_end_user
    campaigns.each do |campaign|
      campaign.campaign_users.each do |campaign_user|
        next unless campaign_user.in_progress_campaign?
        CampaignUsers::UpdateCompletionStatus.call!(campaign_user)
      end
    end
  end
end
