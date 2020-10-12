# frozen_string_literal: true

module CampaignReports
  class BulkDownloadJob < ApplicationJob
    queue_as :default

    def perform(campaign_reports, current_user)
      ::CampaignReports::BulkDownload.call!(campaign_reports, current_user)
    end
  end
end
