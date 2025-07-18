# frozen_string_literal: true

module Api
  module Administration
    class ProficiencyLevelPolicy < ::Api::Administration::BasePolicy
      def create?
        has_permission?('proficiency_levels', 'manage', project_id: project_id)
      end

      def show?
        has_permission?('proficiency_levels', 'view', project_id: project_id)
      end

      def index?
        has_permission?('proficiency_levels', 'view', project_id: project_id)
      end

      def destroy?
        has_permission?('proficiency_levels', 'manage', project_id: project_id)
      end

      def update?
        has_permission?('proficiency_levels', 'manage', project_id: project_id)
      end

      def import?
        has_permission?('proficiency_levels', 'import', project_id: project_id)
      end

      def import_translations?
        has_permission?('proficiency_levels', 'import_translations', project_id: project_id)
      end

      def export?
        has_permission?('proficiency_levels', 'export', project_id: project_id)
      end

      def export_translations?
        has_permission?('proficiency_levels', 'export_translations', project_id: project_id)
      end

      def skill_proficiency?
        has_permission?('proficiency_levels', 'manage', project_id: project_id)
      end

      class Scope < Api::Administration::BasePolicy::Scope
        def resolve
          scope.where(project_id: project_id)
        end
      end
    end
  end
end
