# frozen_string_literal: true

module Api
  module Administration
    class ReportApprovalSettingPolicy < BasePolicy
      def index?
        can_manage_report_approval?
      end

      def show?
        can_manage_report_approval?
      end

      def create?
        can_manage_report_approval?
      end

      def update?
        can_manage_report_approval?
      end

      def destroy?
        can_manage_report_approval?
      end

      def create_with_campaign?(_)
        can_manage_report_approval?
      end

      def create_with_report?(_)
        can_manage_report_approval?
      end

      def replace_campaign?(_)
        can_manage_report_approval?
      end

      def replace_report?(_)
        can_manage_report_approval?
      end

      private

      def can_manage_report_approval?
        has_permission?(:campaigns, :manage_report_approvals)
      end
    end
  end
end
