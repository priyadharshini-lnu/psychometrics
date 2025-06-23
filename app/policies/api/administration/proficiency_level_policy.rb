# frozen_string_literal: true

module Api
  module Administration
    class ProficiencyLevelPolicy < ::Api::Administration::BasePolicy
      def create?
        has_permission?('proficiency_level', 'manage', project_id: project_id)
      end

      def show?
        has_permission?('proficiency_level', 'view', project_id: project_id)
      end

      def index?
        has_permission?('proficiency_level', 'view', project_id: project_id)
      end

      def destroy?
        has_permission?('proficiency_level', 'manage', project_id: project_id)
      end

      def update?
        has_permission?('proficiency_level', 'manage', project_id: project_id)
      end

      def import?
        has_permission?('proficiency_level', 'import', project_id: project_id)
      end

      def import_translations?
        has_permission?('proficiency_level', 'import_translations', project_id: project_id)
      end

      def export?
        has_permission?('proficiency_level', 'export', project_id: project_id)
      end

      def export_translations?
        has_permission?('proficiency_level', 'export_translations', project_id: project_id)
      end

      class Scope < Api::Administration::BasePolicy::Scope
        def resolve
          return scope unless project_id

          if filter&.dig(:include_global)
            scope.where(project_id: [nil, project_id])
          else
            scope.where(project_id: project_id)
          end
        end

        private

        def include_global?
          filter&.dig(:include_global).to_s == 'true'
        end
      end
    end
  end
end
