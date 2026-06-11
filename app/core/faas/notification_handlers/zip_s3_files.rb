# frozen_string_literal: true

module Faas
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
            key: bulk_report.attachment_storage_path('files', "#{data['file_name']}.zip"),
            filename: "#{data['file_name']}.zip",
            byte_size: data['file_size'],
            checksum: data['checksum'],
            content_type: 'application/zip',
            service_name: Settings.storage.private_storage_service
          )

          ActiveStorage::Attachment.create!(
            record: bulk_report,
            blob: blob,
            name: 'files'
          )

          BulkReportMailer.notify(bulk_report).deliver_later
          if admin_job
            bulk_report.files.reload
            url = bulk_report.public_download_urls.first
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
