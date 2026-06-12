# frozen_string_literal: true

module Api
  module Administration
    class ProjectMembershipPolicy < MembershipPolicy
      def export?
        manage_admins? ||
          has_permission?(:audit_reports, :admin_permissions, project_id: project_id, campaign_id: campaign_id)
      end

      def index?
        export?
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

      def spoof?
        manage_admins? && !@record&.user&.superadmin?
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
