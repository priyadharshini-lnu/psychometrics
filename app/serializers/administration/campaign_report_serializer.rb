# frozen_string_literal: true

module Administration
  class CampaignReportSerializer < Panko::Serializer
    attributes :id, :report_id, :name, :user_access, :assessor_access, :report_family_name, :permissions,
               :effective_default_language, :user_dashboard, :main_report, :auto_assign, :available_languages,
               :report_locales, :internal, :custom_upload, :assessment_ids, :report_provider,
               :user_report_id,
               :external_settings, :status

    delegate :name, to: :report
    delegate :name, to: :report_family, prefix: true
    delegate :provider, to: :report, prefix: true
    delegate :external_settings, to: :report

    delegate :assessment_ids, to: :report

    def permissions
      GetPermissionsHash.call!(
        Administration::CampaignReportPolicy,
        current_user,
        object,
        [
          'export',
          %w[remove destroy]
        ],
        {
          project_id: context[:project_id],
          campaign_id: context[:campaign_id]
        }
      )
    end

    def custom_upload
      report.provider_custom_upload?
    end

    def user_report_id
      user_report_for_status&.id
    end

    def status
      user_report_for_status&.status
    end

    private

    def current_user
      context[:current_user]
    end

    def report
      object.report
    end

    def internal
      report.provider_internal?
    end

    def report_locales
      [report.default_language] + report.other_languages
    end

    def report_family
      object.report_family
    end

    def user_report_for_status
      object.user_reports.first
    end
  end
end
