# frozen_string_literal: true

module Reports
  class BulkExportJob < ApplicationJob
    queue_as :reports

    def perform(report_ids, current_user, client = nil)
      assigns_reports = ::AssignsReports::BulkExportWithOptions.new(report_ids, client).query
      assigns_reports.includes(assign: :membership).find_each do |assigns_report|
        AssignsReports::RegenerateReport.call!(assigns_report, current_user)
      end
    end
  end
end
