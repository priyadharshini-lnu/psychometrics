# frozen_string_literal: true

module Threesixty
  module Reports
    class DownloadJob < ApplicationJob
      queue_as :reports

      def perform(threesixty_campaign, current_user, subject, user_report, options = {})
        @threesixty_campaign = threesixty_campaign
        @current_user = current_user
        @subject = subject
        @user_report = user_report
        @options = options

        save_report
        remove_tmp_file
        send_to_user
      rescue Exception => e # rubocop:disable Lint/RescueException
        notify_error
        Raven.capture_exception(e)
      end

      private

      attr_reader :threesixty_campaign, :current_user, :subject, :user_report, :pdf_file, :s3_obj, :options

      # Generates PDF file and placed it into TMP folder
      #
      def save_report
        if !user_report.pdf_exists? || !subject.evaluation_status_completed?
          @pdf_file = ::Threesixty::Reports::ExportReport.
                      call!(current_user, threesixty_campaign, subject, user_report, options)
          user_report.update!(pdf: File.open(pdf_file))
        end
      end

      # Removes TMP folder
      #
      def remove_tmp_file
        FileUtils.rm(pdf_file) if pdf_file
      end

      # Send URL of saved PDF to user
      #
      def send_to_user
        ActionCable.server.broadcast "notification_channel_for_#{current_user.id}",
                                     type: 'success',
                                     message: I18n.t('jobs.threesixty.reports.download.message'),
                                     description: I18n.t(
                                       'jobs.threesixty.reports.download.description',
                                       url: user_report.pdf.url
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
