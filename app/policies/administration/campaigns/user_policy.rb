# frozen_string_literal: true

module Administration
  module Campaigns
    class UserPolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin, :client_admin, :project_admin)
      end

      def show?
        index?
      end

      def create?
        index?
      end

      def update?
        create?
      end

      def reset_password?
        update? && !@record.is_anonym?
      end

      def spoof?
        @user.is?(:superadmin)
      end

      def extend_time?
        index?
      end

      def export_completion_status?
        @user.is?(:superadmin, :client_admin, :project_admin)
      end

      def search?
        index?
      end

      def import?
        index?
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
