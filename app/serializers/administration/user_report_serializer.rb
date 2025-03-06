# frozen_string_literal: true

module Administration
  class UserReportSerializer < Panko::Serializer
    attributes :id, :permissions, :report_id, :name, :user_access,
               :report_family_name, :status, :internal, :report_url,
               :report_provider, :custom_upload, :comments_count, :edits_count
               :hogan_participant_id

    delegate :name, to: :report
    delegate :provider, to: :report, prefix: true
    delegate :name, to: :report_family, prefix: true, allow_nil: true

    def internal
      report.provider_internal?
    end

    def custom_upload
      report.provider_custom_upload?
    end

    def report_url
      object.pdf_download_url
    end

    def all_assessments_are_completed
      object.all_assessments_are_scored?
    end

    def has_report_config
      object.has_report_data_config?
    end

    def user_results_exists
      object.has_user_results?
    end

    def hogan_participant_id
      return nil unless object.hogan?

      object.hogan_credential&.participant_id
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
          'push_webhook',
          'upload_file',
          'remove_file'
        ],
        {
          project_id: campaign.project_id,
          campaign_id: campaign.id
        }
      )
    end

    def comments_count
      object.user_report_comments&.count
    end

    def edits_count
      object.text_module_overrides&.count
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
