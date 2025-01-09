# frozen_string_literal: true

module Api
  module Administration
    class UserReportEventPolicy < BasePolicy
      def index?
        can_manage_user_report_events?
      end

      def export?
        can_manage_user_report_events?
      end

      private

      def can_manage_user_report_events?
        has_permission?(:audit_reports, :user_report_events, project_id: project_id, campaign_id: campaign_id)
      end
    end
  end
end
