# frozen_string_literal: true

module Api
  module Administration
    class JobRolePolicy < BasePolicy
      def index?
        has_permission?(:job_roles, :view, project_id: project_id)
      end

      def create?
        manage?
      end

      def update?
        manage?
      end

      def destroy?
        manage?
      end

      def import_translations?
        manage?
      end

      def export_translations?
        manage?
      end

      def manage?
        has_permission?(:job_roles, :manage, project_id: project_id)
      end

      class Scope < Api::Administration::BasePolicy::Scope
        def resolve
          return scope unless project_id

          if filter&.dig(:include_global_roles)
            scope.where(project_id: [nil, project_id])
          else
            scope.where(project_id: project_id)
          end
        end
      end
    end
  end
end
