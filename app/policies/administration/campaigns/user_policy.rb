# frozen_string_literal: true

module Administration
  module Campaigns
    class UserPolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :view, project_id: project_id, campaign_id: campaign_id
        ) || @user.is?(:assessor)
      end

      def show?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :view, project_id: project_id, campaign_id: campaign_id
        ) || @user.is?(:assessor)
      end

      def create?
        can_mange_campaign_users?
      end

      def add_report?
        can_mange_campaign_users?
      end

      def regenerate_report?
        has_permission?(:results, :regenerate_report)
      end

      def bulk_download?
        has_permission?(:results, :download_report)
      end

      def toggle_status?
        can_mange_campaign_users?
      end

      def edit?
        can_mange_campaign_users?
      end

      def destroy?
        can_mange_campaign_users?
      end

      def update?
        can_mange_campaign_users?
      end

      def export_sign_in_url?
        @user.is?(:superadmin)
      end

      def reset_password?
        has_permission?(:users, :reset_password, project_id: @record.project_id, campaign_id: campaign_id)
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

      def export_compact_completion_status?
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
        can_mange_campaign_users?
      end

      def assign_reports_and_assessments?
        can_mange_campaign_users?
      end

      def export_reports_and_assessments?
        can_mange_campaign_users?
      end

      def export?
        @user.is?(:superadmin) || @user.has_permission?(
          :campaigns, :view, project_id: project_id, campaign_id: campaign_id
        )
      end

      def sso?
        can_mange_campaign_users?
      end

      def assessments_reports?
        can_mange_campaign_users?
      end

      def results?
        @user.has_permission?(
          :results, :scores, project_id: project_id, campaign_id: campaign_id
        )
      end

      def view_workshop_details?
        has_permission?(:workshops, :view)
      end

      private

      def can_mange_campaign_users?
        @user.has_permission?(
          :campaigns, :manage_users, project_id: project_id, campaign_id: campaign_id
        )
      end
    end
  end
end
