# frozen_string_literal: true

module Administration
  module Campaigns
    class UserPolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin) || @user.has_permission?(:campaigns, :view, project_id: project_id)
      end

      def show?
        @user.is?(:superadmin) || @user.has_permission?(:campaigns, :view, project_id: project_id)
      end

      def create?
        @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end

      def add_report?
        @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end

      def regenerate_report?
        @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end

      def toggle_status?
        @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end

      def edit?
        @user.is?(:superadmin) || @user.has_permission?(:projects, :manage_users, project_id: project_id)
      end

      def destroy?
        @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end

      def update?
        @user.is?(:superadmin) || @user.has_permission?(:projects, :manage_users, project_id: project_id)
      end

      def reset_password?
        (@user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :manage_users, project_id: project_id
        )) && !@record.is_anonym?
      end

      def spoof?
        @user.is?(:superadmin)
      end

      def extend_time?
        @user.is?(:superadmin) || @user.has_permission?(:campaigns, :view, project_id: project_id)
      end

      def export_completion_status?
        @user.is?(:superadmin) || @user.has_permission?(:campaigns, :view, project_id: project_id)
      end

      def search?
        @user.is?(:superadmin) || @user.has_permission?(:campaigns, :view, project_id: project_id)
      end

      def import?
        @user.is?(:superadmin) || @user.has_permission?(:campaigns, :manage_users, project_id: project_id)
      end

      class Scope < Administration::BasePolicy::Scope
        def resolve
          return scope if @user.is?(:superadmin)

          project_ids = @user.is?(:client_admin) ? @user.client_admin_project_ids : @user.project_admin_client_ids
          campaign_ids = Campaign.where(project: project_ids).pluck(:id)
          scope.enabled.joins(:campaign_users).where(campaign_users: { campaign_id: campaign_ids })
        end
      end
    end
  end
end
