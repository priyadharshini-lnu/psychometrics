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
      external_report_path = external_report_path(params)
      if external_report_path
        ::Exports::Reports::Pdf::ExternalReportExport.export(params[:report], params[:user], external_report_path, params[:opts])
      else
        export_params = params.values_at(:current_user, :report, :user, :client, :scheme, :opts)
        ::Exports::Reports::Pdf::ReportExport.export(*export_params)
      end
    end

    def external_report_path(params)
      mindmill_report = params[:assign].mindmill_report.path
      hogan_report = params[:assigns_report].external_report.path
      external_report = mindmill_report || hogan_report
    end
  end
end
