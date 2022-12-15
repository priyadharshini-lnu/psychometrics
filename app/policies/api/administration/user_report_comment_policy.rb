# frozen_string_literal: true

module Api
  module Administration
    class UserReportCommentPolicy < BasePolicy
      def initialize(_, _, data)
        super
        @user_report = UserReport.find(data[:user_report_id]) if data[:user_report_id]
      end

      def index?
        can_manage_comments?
      end

      def create?
        can_manage_comments?
      end

      def update?
        can_manage_comments? && (user.is?(:superadmin) || record.creator_id == user.id)
      end

      def destroy?
        can_manage_comments? && (user.is?(:superadmin) || record.creator_id == user.id)
      end

      private

      def can_manage_comments?
        return true if @user.is?(:superadmin)

        ReportApprovalSetting.for_any(@user.id, @user_report.campaign.id).
          exists?(report_id: @user_report.report_id)
      end

      class Scope < Scope
        def resolve
          user.accessible_records(UserReportComment, 'results.view_report').not_deleted
        end
      end
    end
  end
end
