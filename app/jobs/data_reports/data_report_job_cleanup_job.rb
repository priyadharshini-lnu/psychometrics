# frozen_string_literal: true

module DataReports
  class DataReportJobCleanupJob < ApplicationJob
    queue_as :cron_tasks

    def perform
      deleted_count = DataReportJob.cleanup_old_jobs(older_than: 30.days.ago)
      Rails.logger.info "[DataReportJobCleanup] Deleted #{deleted_count} old data report jobs"
    end
  end
end
