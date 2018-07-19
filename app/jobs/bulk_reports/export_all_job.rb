module BulkReports
  class ExportAllJob < ApplicationJob
    queue_as :default

    def perform(params)
      items = query(params[:client]).call(params[:client].id, params[:report_ids], params[:start_date], params[:end_date])
      bulk_report = ::BulkReport.create(user: params[:current_user], queue_size: items.size)
      items.each do |item|
        ::BulkReports::ExportJob.perform_now(job_params(bulk_report, item, params))
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

    def job_params(bulk_report, item, params)
      {
        bulk_report: bulk_report,
        current_user: params[:current_user],
        report: Report.find(item.id),
        assign: Assign.find(item.assign_id),
        assigns_report: AssignsReport.find(item.assigns_report_id),
        user: User.find(item.user_id),
        client: params[:client],
        scheme: params[:scheme],
        opts: params[:opts] || {}
      }
    end
  end
end
