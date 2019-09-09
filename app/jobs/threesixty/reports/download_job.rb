# frozen_string_literal: true

module Threesixty
  module Reports
    class DownloadJob < ApplicationJob
      queue_as :reports

      def perform(threesixty_campaign, current_user, subject, users_report)
        @threesixty_campaign = threesixty_campaign
        @current_user = current_user
        @subject = subject
        @users_report = users_report

        export_report
        save_to_s3
        remove_tmp_file
        send_to_user
      rescue Exception => e
        notify_error
        Raven.capture_exception(e)
      end

      private

      attr_reader :threesixty_campaign, :current_user, :subject, :users_report, :pdf_file, :s3_obj

      # Generates PDF file and placed it into TMP folder
      #
      def export_report
        @pdf_file = ::Threesixty::Reports::ExportReport.
                    call!(current_user, threesixty_campaign, subject, users_report, {})
      end

      # Uploads PDF file to AssignsReport
      #
      def save_to_s3
        filename = File.basename(pdf_file)
        s3 = Aws::S3::Resource.new(region: Rails.application.secrets.region,
                                   access_key_id: Rails.application.secrets.access_key_id,
                                   secret_access_key: Rails.application.secrets.secret_access_key)
        bucket = Rails.application.secrets.directory
        @s3_obj = s3.bucket(bucket).object(filename)

        File.open(pdf_file) do |file|
          s3_obj.put(body: file)
        end
      end

      # Removes TMP folder
      #
      def remove_tmp_file
        FileUtils.rm(pdf_file)
      end

      # Send URL of saved PDF to user
      #
      def send_to_user
        ActionCable.server.broadcast "notification_channel_for_#{current_user.id}",
                                     type: 'success',
                                     message: I18n.t('jobs.threesixty.reports.download.message'),
                                     description: I18n.t(
                                       'jobs.threesixty.reports.download.description', url: s3_obj.presigned_url(:get)
                                     )
      end

      def notify_error
        ActionCable.server.broadcast "notification_channel_for_#{current_user.id}",
                                     type: 'error',
                                     message: I18n.t('jobs.threesixty.reports.download.error'),
                                     description: I18n.t('jobs.threesixty.reports.download.error_description')
      end
    end
  end
end
