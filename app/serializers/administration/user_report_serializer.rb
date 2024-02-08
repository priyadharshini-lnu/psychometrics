# frozen_string_literal: true

module Administration
  class UserReportSerializer < Panko::Serializer
    attributes :id, :permissions, :report_id, :name, :user_access, :report_family_name, :status, :internal, :report_url

    delegate :name, :mindmill, to: :report
    delegate :name, to: :report_family, prefix: true, allow_nil: true

    def internal
      report.provider_internal?
    end

    def report_url
      object.pdf_download_url
    end

    def all_assessments_are_completed
      object.all_assessments_are_completed?
    end

    def has_report_config
      object.has_report_data_config?
    end

    def user_results_exists
      object.has_user_results?
    end

    def permissions
      GetPermissionsHash.call!(
        Administration::UserReportPolicy,
        current_user,
        object,
        [
          %w[view_report show],
          %w[download_report download],
          %w[remove destroy],
          %w[toggle_access toggle_user_access],
          'push_webhook'
        ],
        {
          project_id: campaign.project_id,
          campaign_id: campaign.id
        }
      )
    end

    private

    def campaign
      context[:campaign]
    end

    def current_user
      context[:current_user]
    end

    def report
      object.report
    end

    def report_family
      object.report_family
    end
  end
end
