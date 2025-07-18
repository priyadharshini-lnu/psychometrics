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
        has_permission?(:job_roles, :import_translations, project_id: project_id)
      end

      def export_translations?
        has_permission?(:job_roles, :export_translations, project_id: project_id)
      end

      def manage?
        has_permission?(:job_roles, :manage, project_id: project_id)
      end

      class Scope < Api::Administration::BasePolicy::Scope
        def resolve
          scope.where(project_id: project_id)
        end
      end
    end
  end
end
