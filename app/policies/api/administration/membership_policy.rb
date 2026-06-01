# frozen_string_literal: true

module Api
  module Administration
    class MembershipPolicy < BasePolicy
      class Scope < BasePolicy::Scope
        def resolve
          ::Administration::MembershipPolicy::Scope.new(user, Membership).resolve
        end
      end

      def show?
        @user.is?(:superadmin)
      end

      def update?
        @user.is?(:superadmin)
      end

      def create?
        @user.is?(:superadmin)
      end

      def export?
        has_permission?(:audit_reports, :admin_permissions, project_id: project_id, campaign_id: campaign_id)
      end

      def index?
        export?
      end

      def edit?
        @user.is?(:superadmin)
      end

      def destroy?
        @user.is?(:superadmin)
      end

      def reset_password?
        @user.is?(:superadmin)
      end

      def send_mail?
        @user.is?(:superadmin)
      end

      def spoof?
        return false if @record&.user&.superadmin?

        @user.is?(:superadmin) ||
          has_permission?(:projects, :manage_admins, project_id: project_id) ||
          has_permission?(:campaigns, :manage_admins, project_id: project_id, campaign_id: campaign_id)
      end

      def available_permissions?
        @user.admin?
      end
    end
  end
end
