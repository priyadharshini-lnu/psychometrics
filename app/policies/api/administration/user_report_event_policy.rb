# frozen_string_literal: true

module Api
  module Administration
    class UserReportEventPolicy < BasePolicy
      def export?
        @user.is?(:superadmin, :client_admin, :project_admin,
                  :campaign_admin) || @user.has_permission?(:data_exports, :user_report_events)
      end
    end
  end
end
