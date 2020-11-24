# frozen_string_literal: true

module AdminJobs
  class BulkRegenerateUserReports < AdminJobs::Base
    def call
      user_reports = campaign.user_reports.where(id: record.data['ids'])
      ::UserReports::GenerateAndSavePdf.call!(user_reports, owner, {}, record)
    end

    private

    def campaign
      Campaign.find(record.data['campaign_id'])
    end
  end
end
