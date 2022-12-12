# frozen_string_literal: true

module Api
  module Administration
    class MembershipPolicy < ::Administration::MembershipPolicy
      def index?
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

      def reset_password?
        manage_admins?
      end

      def spoof?
        manage_admins?
      end

      def send_mail?
        manage_admins?
      end

      class Scope < Scope
        def resolve
          ::Administration::MembershipPolicy::Scope.new(user, Membership).resolve
        end
      end

      private

      def manage_admins?
        return true if @user.is?(:superadmin)

        case record.role
          when 'project_admin'
            has_permission?(
              :projects, :manage_admins, project_id: project_id
            )
          when 'campaign_admin'
            has_permission?(
              :campaigns, :manage_admins, project_id: project_id, campaign_id: campaign_id
            )
        end
      end
    end
  end
end
