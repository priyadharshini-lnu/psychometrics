# frozen_string_literal: true

module Api
  module Administration
    class ProjectPolicy < ::Administration::ClientPolicy
      def index?
        @user.is?(:campaign_admin, :project_admin) || has_permission?(:projects, :view, project_id: project_id)
      end

      def show?
        has_permission?(:projects, :view, project_id: project_id)
      end

      def create?
        has_permission?(:projects, :manage, project_id: project_id)
      end

      def seach_user?
        has_permission?(:projects, :manage_users, project_id: project_id)
      end

      def add_manager?
        has_permission?(:projects, :manage_users, project_id: project_id)
      end

      def workshop_status_export?
        has_permission?(:workshops, :export_status, project_id: project_id)
      end

      def export_completion_status?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def export_compact_completion_status?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      class Scope < BasePolicy::Scope
        def resolve
          ProjectAdminClientScope.new(user, Client).resolve.
            includes(design_setting: { logo_attachment: :blob })
        end

        class ProjectAdminClientScope < ::Administration::ClientPolicy::Scope
          def assessor_campaigns_project_ids
            []
          end
        end
      end
    end
  end
end
