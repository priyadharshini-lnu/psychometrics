module BulkReports
  class ExportJob < ApplicationJob
    queue_as :default

    def perform(params)
      params[:opts].merge!(output_dir: params[:bulk_report].input_dir)
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
