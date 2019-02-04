module Reports
  class BulkExportJob < ApplicationJob
    queue_as :reports

    def perform(report_ids, current_user, client = nil)
      assigns_reports = ::AssignsReports::BulkExportWithOptions.new(report_ids, client).query
      assigns_reports.update_all(generating: true)
      assigns_reports.find_each do |assigns_report|
        ::Reports::ExportJob.perform_later(assigns_report, current_user)
      end
    end
  end
end
