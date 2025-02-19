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

          user_report_pdf = user_report.user_report_pdfs.find_or_create_by!(
            locale: user_report.effective_default_language
          )

          user_report_pdf.pdf_file&.purge_later

          pdf_file_attachment = ActiveStorage::Attachment.new(
            record_id: user_report_pdf.id,
            record_type: 'UserReportPdf',
            name: 'pdf_file'
          )

          pdf_file_attachment.blob_id = blob.id

          user_report_pdf.pdf_file_attachment = pdf_file_attachment
          user_report_pdf.set_generated_timestamps

          user_report_pdf.save!
        end
        update_admin_job_progress(data)
        notify_user(data, user_report) if data['notify_user_id']

        broadcast :ok
      end

      private

      def notify_user(data, user_report)
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
              url: blob.url(
                expires_in: 10.minutes.to_i, disposition: 'attachment', filename: user_report.report_name_for_download
              )
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
