module BulkReports
  class ExportJob < ApplicationJob
    queue_as :default

    def perform(bulk_report, current_user, report, user, client, scheme, opts = {})
      opts.merge!(output_dir: bulk_report.input_dir)
      ::Exports::Reports::Pdf::ReportExport.export(current_user, report, user, client, scheme, opts)
      bulk_report.decrement_queue_size
    end
  end
end
