# frozen_string_literal: true

module Api
  module Administration
    class ProjectMembershipPolicy < MembershipPolicy
      def index?
        manage_admins?
      end

      def create?
        manage_admins?
      end

      def show?
        manage_admins?
      end

      def edit?
        manage_admins?
      end

      def destroy?
        manage_admins?
      end

      def update?
        manage_admins?
      end

      def send_mail?
        manage_admins?
      end

      def export?
        manage_admins? || @user.has_permission?(:audit_reports, :admin_permissions)
      end

      private

      def manage_admins?
        return true if @user.is?(:superadmin)

        has_permission?(
          :projects, :manage_admins, project_id: project_id
        )
      end
    end
  end
end
