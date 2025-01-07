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
        @user.is?(:superadmin, :client_admin, :project_admin, :campaign_admin) ||
          @user.has_permission?(:audit_reports, :user_report_events)
      end
    end
  end
end
