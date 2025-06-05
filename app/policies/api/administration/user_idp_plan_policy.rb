# frozen_string_literal: true

module Api
  module Administration
    class UserIdpPlanPolicy < ::Api::Administration::BasePolicy
      def create?
        has_permission?(:idp_plans, :manage)
      end

      def index?
        has_permission?(:idp_plans, :view)
      end

      def show?
        has_permission?(:idp_plans, :view)
      end

      def update?
        true
      end

      class Scope < BasePolicy::Scope
        def resolve
          return scope if @user.superadmin?

          accessible_user_ids = []

          permitted_client_admin_project_ids = @user.client_admin_project_ids.select do |project_id|
            @user.has_permission?(:idp_plans, :manage, project_id: project_id)
          end
          accessible_user_ids.concat(User.where(project_id: permitted_client_admin_project_ids).pluck(:id))

          permitted_project_admin_project_ids = @user.project_admin_client_ids.select do |project_id|
            @user.has_permission?(:idp_plans, :manage, project_id: project_id)
          end
          accessible_user_ids.concat(User.where(project_id: permitted_project_admin_project_ids).pluck(:id))

          campaign_user_ids = []
          @user.campaign_admin_campaigns.each do |campaign|
            campaign_user_ids.concat(campaign.users.pluck(:id))
          end
          accessible_user_ids.concat(campaign_user_ids)

          scope.where(user_id: accessible_user_ids)
        end
      end
    end
  end
end
