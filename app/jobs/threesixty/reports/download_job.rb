# frozen_string_literal: true

module Threesixty
  module Reports
    class DownloadJob < ApplicationJob
      queue_as :reports

      private_attr_reader :threesixty_campaign, :current_user, :subject, :user_report, :file_url, :options

      def perform(threesixty_campaign, current_user, subject, user_report, options = {})
        @threesixty_campaign = threesixty_campaign
        @current_user = current_user
        @subject = subject
        @user_report = user_report
        @options = options

        save_report
      rescue Exception => e # rubocop:disable Lint/RescueException
        notify_error
        Sentry.capture_exception(e)
      end

      private

      # Generates PDF file and placed it into TMP folder
      #
      def save_report
        if !user_report.pdf_exists? || !subject.evaluation_status_completed?
          data = ::UserReports::GeneratePdf.call!(
            user_report,
            current_user,
            options.merge(async: true, notify_user: true)
          )
          if data[:file_path]
            user_report.attach_pdf!(File.open(data[:file_path]))
            notify_user
          end
        else
          notify_user
        end
      end

      # Send URL of saved PDF to user
      #
      def notify_user
        ActionCable.server.broadcast \
          "notification_channel_for_#{current_user.id}",
          {
            type: 'success',
            message: I18n.t('jobs.threesixty.reports.download.message'),
            description: I18n.t(
              'jobs.threesixty.reports.download.description',
              url: user_report.pdf_file.url
            )
          }
      end

      def notify_error
        ActionCable.server.broadcast \
          "notification_channel_for_#{current_user.id}",
          {
            type: 'error',
            message: I18n.t('jobs.threesixty.reports.download.error'),
            description: I18n.t('jobs.threesixty.reports.download.error_description')
          }
      end
    end
  end
end
