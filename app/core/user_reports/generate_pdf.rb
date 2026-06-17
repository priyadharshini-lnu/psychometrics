# frozen_string_literal: true

module UserReports
  class GeneratePdf < BaseCommand
    include Rails.application.routes.url_helpers
    include UserReports::GeneratePdfConcern

    private_attr_reader :current_user, :campaign, :report, :user, :user_report, :options
    attr_reader :output

    def initialize(user_report, current_user, options = {})
      @user_report = user_report
      @record = user_report
      @current_user = current_user
      @campaign = user_report.campaign
      @report = user_report.report
      @user = user_report.user
      @options = options
    end

    def call
      result = if Settings.features.url_to_pdf_faas
                 export_pdf_using_faas(user_report)
               else
                 export_pdf_using_local_chrome
               end

      broadcast :ok, result
    end

    private

    def default_report_export_options
      report.pdf_dimension.merge(url: report_preview_url)
    end

    def make_path
      FileUtils.mkdir_p(report_directory)
      File.join(report_directory, report_file_name)
    end

    def report_preview_url
      if current_user.is?(:regular)
        report_preview_user_url
      elsif current_user.is?(:assessor) && %i[assessor lead_assessor].include?(options[:view_report_as])
        report_preview_assessor_url
      else
        report_preview_admin_url
      end
    end

    def report_preview_assessor_url
      params = default_report_preview_url_params.merge(
        campaign_id: campaign.id
      ).merge(tenant_host_options)

      pdf_preview_assessors_campaign_user_report_url(params)
    end

    def report_preview_admin_url
      if campaign.threesixty?
        params = default_report_preview_url_params.merge(
          threesixty_campaign_id: campaign.id,
          subject_id: Threesixty::Subject.find_by(user_id: user_report.user_id).id,
          format: :pdf
        ).merge(tenant_host_options)

        administration_threesixty_campaign_subject_reports_url(params)
      else
        params = default_report_preview_url_params.merge(
          new_campaign_id: campaign.id
        ).merge(tenant_host_options)

        pdf_preview_administration_new_campaign_user_report_url(params)
      end
    end

    def report_preview_user_url
      if campaign.threesixty?
        params = default_report_preview_url_params.merge(
          subdomain: campaign.project.subdomain,
          campaign_id: campaign.threesixty_campaign.id,
          id: user_report.id,
          format: :pdf
        )
        campaign_report_url(params)
      else
        params = default_report_preview_url_params.merge(subdomain: current_user.project.subdomain)

        pdf_preview_user_report_url(params)
      end
    end

    def report_file_name
      @report_file_name ||=
        "#{user.email}_#{report.decorate.display_name.parameterize(preserve_case: true)}_#{Time.zone.now.strftime('%Y-%m-%d_%H-%M-%S')}.pdf" # rubocop:disable Layout/LineLength
    end

    def report_directory
      Rails.root.join('tmp/reports', user.email)
    end

    def tenant_host_options
      host_options = AdminSubdomain.host_options_for(user: current_user, project: campaign.project)
      host_options[:host].present? ? host_options : { subdomain: Settings.subdomain }
    end

    def default_report_preview_url_params
      {
        host: Settings.domain,
        user_token: current_user.authentication_token,
        lang: options[:lang] || report.default_language || I18n.locale,
        port: Settings.port,
        protocol: Settings.protocol,
        id: user_report.id,
        skip_logic: options[:skip_logic]
      }
    end
  end
end
