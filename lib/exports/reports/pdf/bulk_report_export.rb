# frozen_string_literal: true

module Exports
  module Reports
    module Pdf
      class BulkReportExport
        def self.export(params)
          items = query(params[:client]).
                  call(params[:client].id, params[:report_ids], params[:start_date], params[:end_date]).
                  to_a
          if items.any?
            bulk_report = ::BulkReport.create(user: params[:current_user], queue_size: items.size)

            items.each do |item|
              export_params = {
                bulk_report: bulk_report,
                report: Report.find(item.id),
                assign: Assign.find(item.assign_id),
                assigns_report: AssignsReport.find(item.assigns_report_id),
                user: User.find(item.user_id)
              }
              ::BulkReports::ExportJob.perform_later(export_params)
            end
          end

          items.any?
        end

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
