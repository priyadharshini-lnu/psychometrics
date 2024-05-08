# frozen_string_literal: true

module Lambdas
  module NotificationHandlers
    class ZipS3Files < Base
      include ActionView::Helpers::TagHelper
      include ActionView::Context
      include Rails.application.routes.url_helpers

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
          blob = ActiveStorage::Blob.create_before_direct_upload!(
            key: data['file_name'],
            filename: "#{data['file_name']}.zip",
            byte_size: data['file_size'],
            checksum: data['checksum'],
            content_type: 'application/zip',
            service_name: 's3_private_bucket'
          )

          bulk_report.files.attach(blob)
          BulkReportMailer.notify(bulk_report).deliver_later
          if admin_job
            content = content_tag(
              :a,
              data['file_name'],
              href: blob.url(expires_in: 10.minutes.to_i, disposition: 'attachment')
            )
            admin_job.update!(content: content)
            admin_job.complete!
          end
        end

        broadcast :ok
      end
    end
  end
end
