module Exports
  module Reports
    module Pdf
      class BulkReportExport
        def self.export(params)
          items = query(params[:client]).call(params[:client].id, params[:report_ids], params[:start_date], params[:end_date]).to_a
          if items.any?
            bulk_report = ::BulkReport.create(user: params[:current_user], queue_size: items.size)

            items.each do |item|
              report = Report.find(item.id)
              user = User.find(item.user_id)
              ::BulkReports::ExportJob.perform_later(bulk_report, params[:current_user], report, user, params[:client],
                                                     params[:scheme], params[:opts] || {})
            end
          end

          items.any?
        end

        private

        def self.query(client)
          if client.project?
            ::Queries::Reports::ProjectLevel::BulkReportWithOptions
          else
            ::Queries::Reports::SubProjectLevel::BulkReportWithOptions
          end
        end
      end
    end
  end
end
