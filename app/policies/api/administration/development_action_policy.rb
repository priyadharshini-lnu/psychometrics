# frozen_string_literal: true

module Api
  module Administration
    class DevelopmentActionPolicy < Administration::BasePolicy
      def index?
        has_permission?('development_actions', 'view', project_id: project_id)
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
        has_permission?('development_actions', 'import', project_id: project_id)
      end

      def export?
        has_permission?('development_actions', 'export', project_id: project_id)
      end

      def import_translations?
        has_permission?('development_actions', 'import_translations', project_id: project_id)
      end

      def export_translations?
        has_permission?('development_actions', 'export_translations', project_id: project_id)
      end

      def import_global?
        @user.is?(:superadmin)
      end

      def export_global?
        @user.is?(:superadmin)
      end

      def import_global_translations?
        @user.is?(:superadmin)
      end

      def export_global_translations?
        @user.is?(:superadmin)
      end

      class Scope < BasePolicy::Scope
        def resolve
          return scope if user.is?(:superadmin)

          # Collect project IDs where the user has view permission for development actions
          permitted_client_admin_project_ids = @user.client_admin_client_ids.select do |client_id|
            @user.has_permission?('development_actions', 'view', project_id: client_id)
          end

          permitted_project_admin_project_ids = @user.project_admin_client_ids.select do |project_id|
            @user.has_permission?('development_actions', 'view', project_id: project_id)
          end
          # Combine all permitted project IDs
          all_permitted_project_ids = permitted_client_admin_project_ids +
                                      permitted_project_admin_project_ids

          scope.where(project_id: all_permitted_project_ids)
        end
      end
    end
  end
end
