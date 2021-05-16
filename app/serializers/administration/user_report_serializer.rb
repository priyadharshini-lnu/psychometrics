# frozen_string_literal: true

module Administration
  class UserReportSerializer < ActiveModel::Serializer
    attributes :id, :permissions, :report_id, :name, :user_access, :report_family_name, :status, :internal, :report_url

    delegate :name, :mindmill, to: :report
    delegate :name, to: :report_family, prefix: true, allow_nil: true

    def internal
      report.provider_internal?
    end

    def report_url
      object.pdf.download_url
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
          %w[toggle_access toggle_user_access]
        ]
      )
    end

    private

    def current_user
      @instance_options[:current_user]
    end

    def report
      object.report
    end

    def report_family
      object.report_family
    end
  end
end
