# frozen_string_literal: true

module Administration
  class CampaignReportSerializer < ActiveModel::Serializer
    attributes :id, :report_id, :name, :user_access, :assessor_access, :report_family_name, :permissions,
               :user_dashboard, :main_report

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
          project_id: @instance_options[:project_id],
          campaign_id: @instance_options[:campaign_id]
        }
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
