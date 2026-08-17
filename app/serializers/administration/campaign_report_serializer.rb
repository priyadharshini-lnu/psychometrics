# frozen_string_literal: true

module Administration
  class CampaignReportSerializer < Panko::Serializer
    attributes :id, :report_id, :name, :user_access, :assessor_access, :report_family_name, :permissions,
               :effective_default_language, :user_dashboard, :main_report, :auto_assign, :available_languages,
               :report_locales, :internal, :custom_upload, :assessment_ids, :report_provider,
               :user_report_id,
               :owner,
               :external_settings, :status, :tenant_id

    delegate :name, to: :report, allow_nil: true
    delegate :name, to: :report_family, prefix: true, allow_nil: true
    delegate :provider, to: :report, prefix: true, allow_nil: true
    delegate :external_settings, to: :report, allow_nil: true
    delegate :tenant_id, to: :report, allow_nil: true

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

    def available_languages
      object.available_languages || []
    end

    def assessment_ids
      report&.assessment_ids || []
    end

    def custom_upload
      report&.provider_custom_upload?
    end

    def user_report_id
      user_report_for_status&.id
    end

    def status
      user_report_for_status&.status
    end

    def owner
      return unless report&.owner

      { id: report.owner.id, name: report.owner.name }
    end

    private

    def current_user
      context[:current_user]
    end

    def report
      object&.report
    end

    def internal
      report&.provider_internal?
    end

    def report_locales
      return [] unless report

      [report.default_language] + report.other_languages
    end

    def report_family
      object&.report_family
    end

    def user_report_for_status
      object&.user_reports&.first
    end
  end
end
