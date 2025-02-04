# frozen_string_literal: true

module Api
  module Administration
    class SkillPolicy < Administration::BasePolicy
      def index?
        @user.is?(:superadmin)
      end

      def create?
        @user.is?(:superadmin)
      end

      def update?
        @user.is?(:superadmin)
      end

      def destroy?
        @user.is?(:superadmin)
      end

      def show?
        @user.is?(:superadmin)
      end

      def import?
        @user.is?(:superadmin)
      end

      def search?
        @user.has_permission?(:skills, :view) || @user.has_permission?(:skills, :manage)
      end

      def tags_search?
        search?
      end

      def add_tag?
        @user.is?(:superadmin)
      end

      def remove_tag?
        @user.is?(:superadmin)
      end

      class Scope < BasePolicy::Scope
        def resolve
          return scope if @user.superadmin?

          accessible_project_ids = []
          accessible_project_ids.concat(@user.client_admin_project_ids)
          accessible_project_ids.concat(@user.project_admin_client_ids)
          accessible_project_ids.concat(@user.campaign_admin_campaigns.map(&:project_id))

          if @user.has_permission?(:skills, :view) && @user.has_permission?(:skills, :manage)
            scope.where(project_id: [nil, *accessible_project_ids])
          else
            scope.where(project_id: accessible_project_ids)
          end
        end
      end
    end
  end
end
