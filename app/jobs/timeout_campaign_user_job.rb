# frozen_string_literal: true

class TimeoutCampaignUserJob < ApplicationJob
  # Set completion status of campaign_users
  def perform
    CampaignUsers::Timeout.call!
  end
end
