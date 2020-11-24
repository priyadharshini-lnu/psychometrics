# frozen_string_literal: true

module AdminJobs
  class BulkRegenerateReports < AdminJobs::Base
    def call
      campaign_reports = campaign.campaign_reports.where(id: record.data['ids'])

      user_reports = campaign_reports.map(&:user_reports).flatten

      ::UserReports::GenerateAndSavePdf.call!(user_reports, owner, {}, record)
    end

    private

    def campaign
      Campaign.find(record.data['campaign_id'])
    end
  end
end
