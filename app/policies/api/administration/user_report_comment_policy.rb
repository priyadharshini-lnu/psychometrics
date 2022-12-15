# frozen_string_literal: true

module Api
  module Administration
    class UserReportCommentPolicy < BasePolicy
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
        has_permission?(:campaigns, :manage_report_approvals)
      end

      class Scope < Scope
        def resolve
          user.accessible_records(UserReportComment, 'campaigns.manage_report_approvals').not_deleted
        end
      end
    end
  end
end
