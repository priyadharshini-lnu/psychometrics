# frozen_string_literal: true
module Threesixty
  module Reports
    class ExportReport < BaseCommand
      attr_accessor :output

      def initialize(current_user, threesixty_campaign, subject, users_report, opts = {})
        @current_user = current_user
        @threesixty_campaign = threesixty_campaign
        @report = threesixty_campaign.report
        @subject = subject
        @user = subject.user
        @users_report = users_report
        @opts = opts
      end

      def call
        make_path
        build_url
        export_report

        broadcast :ok, output
      end

      private

      attr_reader :current_user, :threesixty_campaign, :report, :subject, :user, :users_report, :opts, :url

      def export_report
        args = {
          url: url,
          output: output,
          pageWidth: report.props&.dig('sizes', 'width') || 850,
          pageHeight: report.props&.dig('sizes', 'height') || 1100,
          auth: Rails.application.secrets.http_auth
        }.merge(opts).to_a.map { |key, value| "#{key}='#{value}'" }.join(' ')

        Rails.logger.info "$(cd #{Rails.root.to_s} && npm run export_pdf -- #{args})"
        system("$(cd #{Rails.root.to_s} && npm run export_pdf -- #{args})")
      end

      # Creates folder and file to the report
      #
      def make_path
        dir = opts.delete(:output_dir) || Rails.root.join('tmp', 'reports')
        dir = File.join(dir, user.email)
        filename = "#{user.email}_#{report.decorate.display_name.parameterize}_#{Date.today.strftime('%F')}.pdf"

        FileUtils.mkdir_p(dir)
        @output = File.join(dir, filename)
      end

      # Builds URL to report page
      #
      def build_url
        # Generate valid url for parse report to pdf
        params = {
          host: Settings.domain,
          user_token: current_user.authentication_token,
          lang: opts[:lang] || report.default_language || I18n.locale,
          port: Settings.port,
          protocol: Settings.protocol,
          format: :pdf
        }

        @url = current_user.is?(:superadmin, :client_admin, :project_admin) ?
               build_administration_url(params) :
               build_user_url(params)
      end

      # Builds URL for Administration side
      #
      def build_administration_url(params = {})
        params = params.merge(
          threesixty_campaign_id: threesixty_campaign.id,
          subject_id: subject.id
        )

        Rails.
          application.
          routes.
          url_helpers.
          administration_threesixty_campaign_subject_reports_url(params)
      end

      # Builds URL for End User side
      #
      def build_user_url(params = {})
        params = params.merge(
          subdomain: threesixty_campaign.campaign.project.subdomain,
          campaign_id: threesixty_campaign.id,
          id: users_report.id,
        )

        Rails.
          application.
          routes.
          url_helpers.
          campaign_report_url(params)
      end
    end
  end
end
