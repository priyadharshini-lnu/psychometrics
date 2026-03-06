# frozen_string_literal: true

module Administration
  class CampaignReportSerializer < Panko::Serializer
    attributes :id, :report_id, :name, :user_access, :assessor_access, :report_family_name, :permissions,
               :effective_default_language, :user_dashboard, :main_report, :auto_assign, :available_languages,
               :report_locales, :internal, :custom_upload

    delegate :name, to: :report
    delegate :name, to: :report_family, prefix: true

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
  end
end
