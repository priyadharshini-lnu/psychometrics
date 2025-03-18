# frozen_string_literal: true

module Api
  module Administration
    class ReportApprovalPolicy < BasePolicy
      def index?
        can_manage_report_approval?
      end

      def search_campaign?
        can_manage_report_approval?
      end

      def search_report?
        can_manage_report_approval?
      end

      def search_user?
        can_manage_report_approval?
      end

      def metadata_for_filters?
        can_manage_report_approval?
      end

      class Scope < BasePolicy::Scope
        def resolve
          ::ReportApprovalSetting.report_approvals(user)
        end
      end

      private

      def can_manage_report_approval?
        @user.is?(:superadmin, :client_admin, :project_admin, :campaign_admin)
      end
    end
  end
end
