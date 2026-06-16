# frozen_string_literal: true

module UserReports
  class GenerateIdpReportPdf < BaseCommand
    include Rails.application.routes.url_helpers
    include UserReports::GeneratePdfConcern

    private_attr_reader :current_user, :campaign, :report, :user, :user_idp_plan, :options
    attr_reader :output

    def initialize(user_idp_plan, current_user, options = {})
      @user_idp_plan = user_idp_plan
      @record = user_idp_plan
      @current_user = current_user
      @campaign = user_idp_plan.campaign
      @user = user_idp_plan.user
      @options = options
      @job_record = options[:admin_job_record_id] ? AdminJobRecord.find(options[:admin_job_record_id]) : nil
    end

    def call
      result = if Settings.features.url_to_pdf_faas
                 export_pdf_using_faas(user_idp_plan)
               else
                 export_pdf_using_local_chrome
               end

      broadcast :ok, result
    end

    private

    def default_report_export_options
      # TODO: update page format once verify requirements
      { width: '1122px', height: '793px' }.merge(url: report_preview_url)
    end

    def report_preview_url
      if current_user.is?(:regular)
        pdf_preview_user_idp_plan_url(
          default_report_preview_url_params.merge(
            subdomain: user.project.subdomain,
            user_id: user.id,
            include_reflective_questions: !!options[:include_reflective_questions]
          )
        )
      else
        pdf_preview_administration_new_campaign_user_idp_report_url(
          default_report_preview_url_params.merge!(
            new_campaign_id: campaign.id,
            include_reflective_questions: !!options[:include_reflective_questions]
          ).merge(tenant_host_options)
        )
      end
    end

    def tenant_host_options
      host_options = AdminSubdomain.host_options_for(user: current_user, project: campaign.project)
      host_options[:host].present? ? host_options : { subdomain: Settings.subdomain }
    end

    def report_file_name
      @report_file_name ||=
        "#{user.email}_idp_report_#{options[:lang] || 'en'}#{'_rq' if options[:include_reflective_questions]}_#{
          Time.zone.now.strftime('%Y-%m-%d_%H-%M-%S')
        }.pdf".strip
    end

    def report_directory
      Rails.root.join('tmp/idp_reports', user.email)
    end

    def default_report_preview_url_params
      {
        host: Settings.domain,
        user_token: current_user.authentication_token,
        lang: options[:lang] || I18n.locale,
        port: Settings.port,
        protocol: Settings.protocol,
        id: user_idp_plan.id,
        skip_logic: options[:skip_logic]
      }
    end
  end
end
