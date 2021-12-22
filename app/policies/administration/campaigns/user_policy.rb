# frozen_string_literal: true

module Administration
  module Campaigns
    class UserPolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def show?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def create?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
        )
      end

      def add_report?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
        )
      end

      def regenerate_report?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
        )
      end

      def toggle_status?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
        )
      end

      def edit?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
        )
      end

      def destroy?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
        )
      end

      def update?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
        )
      end

      def reset_password?
        (@user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
        )) && !@record.is_anonym?
      end

      def spoof?
        @user.is?(:superadmin)
      end

      def extend_time?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def export_completion_status?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def search?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def import?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
        )
      end
    end
  end
end
