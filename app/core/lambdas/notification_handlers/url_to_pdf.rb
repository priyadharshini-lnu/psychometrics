# frozen_string_literal: true

module Lambdas
  module NotificationHandlers
    class UrlToPdf < Base
      def call
        user_report = UserReport.find(data['user_report_id'])
        if data['status'] == 'failed'
          admin_job&.update!(status: :failed, error_messages: [data['error']])
          return broadcast :ok
        end

        if data['update_record']
          user_report.pdf_file&.purge_later
          blob = ActiveStorage::Blob.create_before_direct_upload!(
            key: data['file_path'],
            filename: data['file_name'],
            byte_size: data['file_size'],
            checksum: data['checksum'],
            content_type: 'application/pdf',
            service_name: Settings.storage.private_storage_service
          )

          ActiveStorage::Attachment.create!(
            record: user_report,
            blob: blob,
            name: 'pdf_file'
          )

          user_report.status = :prepared
          user_report.save!
        end
        update_admin_job_progress(data)
        notify_user(data) if data['notify_user_id']

        broadcast :ok
      end

      private

      def notify_user(data)
        blob = ActiveStorage::Blob.new(
          key: data['file_path'],
          filename: data['file_name'],
          byte_size: data['file_size'],
          checksum: data['checksum'],
          content_type: 'application/pdf',
          service_name: Settings.storage.private_storage_service
        )

        ActionCable.server.broadcast \
          "notification_channel_for_#{data['notify_user_id']}",
          {
            type: 'success',
            message: I18n.t('jobs.threesixty.reports.download.message'),
            description: I18n.t(
              'jobs.threesixty.reports.download.description',
              url: blob.url(expires_in: 10.minutes.to_i, disposition: 'attachment', filename: data['file_name'])
            )
          }
      end

      def update_admin_job_progress(data)
        return unless data['admin_job_record_id']

        admin_job&.increment_completed_tasks!
      end

      def admin_job
        @admin_job ||= AdminJobRecord.find_by(id: data['admin_job_record_id'])
      end
    end
  end
end
