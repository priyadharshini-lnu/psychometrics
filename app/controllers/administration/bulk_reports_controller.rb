module Administration
  class BulkReportsController < Administration::BaseController
    prepend_before_action :set_resource_class
    append_before_action :pundit_authorize

    def new
      respond_to do |format|
        format.js
      end
    end

    def create
      @_client = Client.find(report_params[:client_id])
      reports = query(export_params[:client]).call(export_params[:client].id, export_params[:report_ids],
                                                   export_params[:start_date], export_params[:end_date])
      if reports.any?
        ::BulkReports::ExportAllJob.perform_later(export_params)
        respond_to do |format|
          format.js
        end
      else
        flash.now[:error] = t('.no_data')
        respond_to do |format|
          format.js { render :new }
        end
      end
    end

    def download
      report = BulkReport.find(params[:id])
      if report && report.file.file.exists?
        redirect_to report.private_download_url
      else
        redirect_to(administration_root_path, error: t('.removed'))
      end
    end

    private

    def query(client)
      if client.project?
        ::Queries::Reports::ProjectLevel::BulkReportWithOptions
      else
        ::Queries::Reports::SubProjectLevel::BulkReportWithOptions
      end
    end

    def export_params
      {
        current_user: current_user,
        client: client,
        report_ids: report_params[:ids].reject(&:blank?),
        start_date: report_params[:start_date],
        end_date: report_params[:end_date]
      }
    end

    def report_params
      params.require(:report).permit([:client_id, { ids: [] }, :start_date, :end_date])
    end

    def set_resource_class
      @_resource_class ||= BulkReport
    end
  end
end
