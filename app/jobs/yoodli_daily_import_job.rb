# frozen_string_literal: true

class YoodliDailyImportJob < ApplicationJob
  queue_as :cron_tasks

  def perform(date = nil, campaign_id = nil)
    Yoodli::ImportFromS3Service.call(date: date, campaign_id: campaign_id)
  end
end
