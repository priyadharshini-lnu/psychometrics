# frozen_string_literal: true

class CampaignStatusUpdaterJob < ApplicationJob
  queue_as :cron_tasks

  def perform
    Campaigns::UpdateCampaignStatus.new.call
  end
end
