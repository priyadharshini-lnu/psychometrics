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
      result = if Settings.features.url_to_pdf_lambda
                 export_pdf_using_lambda
               else
                 export_pdf_using_local_chrome
               end

      broadcast :ok, result
    end

    private

    def export_pdf_using_local_chrome
      file_path = make_path
      args = default_report_export_options.merge(
        output: file_path
      ).to_a.map do |key, value|
        "#{key}='#{key == :url ? value : Shellwords.escape(value)}'"
      end.join(' ')

      Rails.logger.info "$(cd #{Rails.root} && npm run export_pdf -- #{args})"
      Kernel.system("$(cd #{Rails.root} && npm run export_pdf -- #{args})")
      { file_path: file_path }
    end

    def export_pdf_using_lambda # rubocop:disable Metrics/AbcSize
      file_path =  "#{options[:file_path] || user_report.pdf.store_dir}/#{report_file_name}"
      webhook_message = { user_report_id: user_report.id, file_name: report_file_name, file_path: file_path }
      webhook_message[:notify_user_id] = current_user.id if options[:notify_user]
      webhook_message[:update_record] = options[:update_record] != false
      webhook_message[:admin_job_record_id] = options[:admin_job_record_id] if options[:admin_job_record_id]

      lambda_option = default_report_export_options.merge(
        output_file_path: "#{options[:file_path] || user_report.pdf.store_dir}/#{report_file_name}",
        webhook_message: webhook_message,
        async: options[:async],
        low_priority: options[:low_priority],
        meta: {
          campaign_id: campaign.id,
          report_id: report.id,
          user_id: user.id
        },
        pdf_password: campaign.pdf_password
      )
      Rails.logger.info(
        log_type: 'UserReports::GeneratePdf',
        campaign_id: campaign.id,
        report_id: report.id,
        user_id: user.id,
        options: options
      )

      file_url = Lambdas::UrlToPdf.call!(lambda_option)
      { file_url: file_url, file_name: report_file_name }
    end

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
      elsif current_user.is?(:assessor) && options[:view_report_as] == :assessor
        report_preview_assessor_url
      else
        report_preview_admin_url
      end
    end

    def report_preview_assessor_url
      params = default_report_preview_url_params.merge!(
        subdomain: Settings.subdomain,
        campaign_id: campaign.id
      )

      pdf_preview_assessors_campaign_user_report_url(params)
    end

    def report_preview_admin_url
      if campaign.threesixty?
        params = default_report_preview_url_params.merge(
          threesixty_campaign_id: campaign.threesixty_campaign.id,
          subdomain: Settings.subdomain,
          subject_id: Threesixty::Subject.find_by(user_id: user_report.user_id).id,
          format: :pdf
        )
        administration_threesixty_campaign_subject_reports_url(params)
      else
        params = default_report_preview_url_params.merge(
          subdomain: Settings.subdomain,
          new_campaign_id: campaign.id
        )

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
