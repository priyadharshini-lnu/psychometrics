# frozen_string_literal: true

module Faas
  module NotificationHandlers
    class UrlToPdf < Base
      ALLOWED_TYPES = %w[UserReport UserIdpPlan].freeze

      def call # rubocop:disable Metrics/AbcSize
        record = find_record
        if data['status'] == 'failed'
          admin_job&.update!(status: :failed, error_messages: [data['error']])
          return broadcast :ok
        end

        if data['update_record']
          blob = ActiveStorage::Blob.create_before_direct_upload!(
            key: data['file_path'],
            filename: data['file_name'],
            byte_size: data['file_size'],
            checksum: data['checksum'],
            content_type: 'application/pdf',
            service_name: Settings.storage.private_storage_service
          )

          report_pdf = record.report_pdfs.find_or_create_by!(
            locale: data['lang'] || I18n.locale
          )

          report_pdf.pdf_file&.purge_later

          pdf_file_attachment = ActiveStorage::Attachment.new(
            record_id: report_pdf.id,
            record_type: report_pdf.class.name,
            name: 'pdf_file'
          )

          pdf_file_attachment.blob_id = blob.id

          report_pdf.pdf_file_attachment = pdf_file_attachment
          report_pdf.set_generated_timestamps

          report_pdf.save!

          if record.is_a?(UserReport)
            record.update(status: :prepared)
            UserReports::Webhook.new(record, report_pdf.locale).publish_report_available
          end
        end
        update_admin_job_progress(data)
        notify_user(data, record) if data['notify_user_id']

        broadcast :ok
      end

      private

      def find_record
        unless ALLOWED_TYPES.include?(data['record_type'])
          return admin_job&.update!(status: :failed, error_messages: ['Invalid record type'])
        end

        data['record_type'].constantize.find(data['record_id'])
      end

      def notify_user(data, record)
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
                expires_in: 10.minutes.to_i, disposition: 'attachment', filename: record.report_name_for_download
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
