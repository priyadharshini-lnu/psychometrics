# frozen_string_literal: true

module UserReports
  class GeneratePdf < BaseCommand
    include Rails.application.routes.url_helpers

    private_attr_reader :current_user, :campaign, :report, :user, :user_report, :options
    attr_reader :output

    def initialize(user_report, current_user, options = {})
      @user_report = user_report
      @current_user = current_user
      @campaign = user_report.campaign
      @report = user_report.report
      @user = user_report.user
      @options = options
    end

    def call
      make_path
      export_report

      broadcast :ok, output
    end

    private

    def export_report
      args = {
        url: report_preview_url,
        output: output,
        pageWidth: report.props&.dig('sizes', 'width') || 850,
        pageHeight: report.props&.dig('sizes', 'height') || 1100,
        auth: Rails.application.secrets.http_auth
      }.to_a.map { |key, value| "#{key}='#{value}'" }.join(' ')

      Rails.logger.info "$(cd #{Rails.root} && npm run export_pdf -- #{args})"
      Kernel.system("$(cd #{Rails.root} && npm run export_pdf -- #{args})")
    end

    def make_path
      FileUtils.mkdir_p(report_directory)
      @output = File.join(report_directory, report_file_name)
    end

    def report_preview_url
      if current_user.is?(:regular)
        report_preview_user_url
      else
        report_preview_admin_url
      end
    end

    def report_preview_admin_url
      params = {
        host: Settings.domain,
        user_token: current_user.authentication_token,
        lang: options[:lang] || report.default_language || I18n.locale,
        port: Settings.port,
        protocol: Settings.protocol,
        new_campaign_id: campaign.id,
        id: user_report.id
      }

      pdf_preview_administration_new_campaign_user_report_url(params)
    end

    def report_preview_user_url
      params = {
        host: Settings.domain,
        subdomain: current_user.project.subdomain,
        user_token: current_user.authentication_token,
        lang: options[:lang] || report.default_language || I18n.locale,
        port: Settings.port,
        protocol: Settings.protocol,
        id: user_report.id
      }

      pdf_preview_user_report_url(params)
    end

    def report_file_name
      "#{user.email}_#{report.decorate.display_name.parameterize}_#{Date.today.strftime('%F')}.pdf"
    end

    def report_directory
      dir = Rails.root.join('tmp', 'reports')
      File.join(dir, user.email)
    end
  end
end
