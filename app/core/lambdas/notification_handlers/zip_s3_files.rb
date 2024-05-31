# frozen_string_literal: true

module Lambdas
  module NotificationHandlers
    class ZipS3Files < Base
      include ActionView::Helpers::TagHelper
      include ActionView::Context

      def call
        bulk_report = BulkReport.find_by(id: data['bulk_report_id'])
        return broadcast :ok unless bulk_report

        admin_job = AdminJobRecord.find_by(id: data['admin_job_record_id'])
        if admin_job && data['status'] == 'failed'
          admin_job.update!(status: :failed, error_messages: [data['error']])
          return broadcast :ok
        end
        admin_job.update!(completed_tasks: data['completed_tasks']) if admin_job && data['completed_tasks']

        if data['status'] == 'completed'
          bulk_report.update_columns(files: [data['file_name']])
          BulkReportMailer.notify(bulk_report).deliver_later
          if admin_job
            url = Utility::Url.generate(:download_administration_bulk_report_url, id: bulk_report.id)
            content = content_tag(:a, data['file_name'], href: url)
            admin_job.update!(content: content)
            admin_job.complete!
          end
        end

        broadcast :ok
      end
    end
  end
end
