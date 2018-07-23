module BulkReports
  class ExportJob < ApplicationJob
    queue_as :default

    def perform(params)
      bulk_report = params[:bulk_report]
      params[:opts].merge!(output_dir: bulk_report.input_dir)
      export(params)
      bulk_report.decrement_queue_size
    end

    private

    def export(params)
      if params[:report].external_report?
        export_params = params.values_at(:assign, :report, :assigns_report, :user, :opts)
        ::Exports::Reports::Pdf::ExternalReportExport.export(*export_params)
      else
        export_params = params.values_at(:current_user, :report, :user, :client, :scheme, :opts)
        ::Exports::Reports::Pdf::ReportExport.export(*export_params)
      end
    end
  end
end
