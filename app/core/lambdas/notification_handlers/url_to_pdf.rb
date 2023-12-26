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
          # user_report.update(pdf: data['file_name']) doesnt work with carrierwave.Refer below link.
          # https://github.com/carrierwaveuploader/carrierwave/issues/2468
          # This code will be changed with the active storage implementation.
          user_report.write_attribute(:pdf, data['file_name']) # dont change this line.
          user_report.status = :prepared
          user_report.save!
        end
        update_admin_job_progress(data)
        notify_user(data) if data['notify_user_id']

        broadcast :ok
      end

      private

      def notify_user(data)
        content_disposition = "attachment; filename=\"#{data['file_name']}\""
        file_url = Aws::S3::Presigner.new.presigned_url(
          :get_object,
          bucket: Rails.application.secrets.s3_compatible_storage[:private_bucket],
          key: data['file_path'],
          expires_in: 10.minutes.to_i,
          response_content_disposition: content_disposition
        ).to_s
        ActionCable.server.broadcast \
          "notification_channel_for_#{data['notify_user_id']}",
          {
            type: 'success',
            message: I18n.t('jobs.threesixty.reports.download.message'),
            description: I18n.t(
              'jobs.threesixty.reports.download.description',
              url: file_url
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
