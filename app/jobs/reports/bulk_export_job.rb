module Reports
  class BulkExportJob < ApplicationJob
    queue_as :reports

    def perform(report_ids, current_user_id, client_id = nil)
      client = Client.find_by(id: client_id)
      assigns_reports = AssignsReports::BulkExportWithOptions.new(report_ids, client).query
      assigns_reports.update_all(generating: true)
      assigns_reports.find_each do |assigns_report|
        ::Reports::ExportJob.perform_later(assigns_report.id, current_user_id)
      end
    end
  end
end
