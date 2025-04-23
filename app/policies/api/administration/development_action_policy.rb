# frozen_string_literal: true

module Api
  module Administration
    class DevelopmentActionPolicy < ::Api::Administration::BasePolicy
      def index?
        has_permission?('development_actions', 'view', project_id: project_id)
      end

      def create?
        has_permission?('development_actions', 'manage', project_id: project_id)
      end

      def update?
        has_permission?('development_actions', 'manage', project_id: project_id)
      end

      def destroy?
        has_permission?('development_actions', 'manage', project_id: project_id)
      end

      def show?
        has_permission?('development_actions', 'view', project_id: project_id)
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

          permitted_client_admin_project_ids = @user.client_admin_clients.select do |client|
            @user.has_permission?('development_actions', 'view', project_id: client.id)
          end.flat_map(&:project_ids)

          permitted_project_admin_project_ids = @user.project_admin_client_ids.select do |project_id|
            @user.has_permission?('development_actions', 'view', project_id: project_id)
          end

          all_permitted_project_ids = permitted_client_admin_project_ids +
                                      permitted_project_admin_project_ids

          scope.where(project_id: all_permitted_project_ids)
        end
      end
    end
  end
end
