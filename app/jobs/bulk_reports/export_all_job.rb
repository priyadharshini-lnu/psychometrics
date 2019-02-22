module BulkReports
  class ExportAllJob < ApplicationJob
    queue_as :default

    def perform(params)
      items = query(params[:client]).call(params[:client].id, params[:report_ids], params[:start_date], params[:end_date])
      return if items.empty?

      bulk_report = ::BulkReport.create(user: params[:current_user])
      FileUtils.rm_rf(bulk_report.input_dir) if File.directory?(bulk_report.input_dir)
      items.each do |item|
        ::BulkReports::ExportJob.perform_now(job_params(bulk_report, item, params))
      end
      ::BulkReports::CompressJob.perform_now(bulk_report)
      BulkReportMailer.notify(bulk_report).deliver_later
      FileUtils.rm_rf(bulk_report.input_dir)
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
      report = Report.find(item.id)
      {
        bulk_report: bulk_report,
        current_user: params[:current_user],
        report: report,
        assign: Assign.find(item.assign_id),
        assigns_report: AssignsReport.find(item.assigns_report_id),
        user: User.find(item.user_id),
        client: params[:client],
        opts: {
          lang: report.default_language
        }
      }
    end
  end
end
