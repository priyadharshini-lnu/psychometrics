# frozen_string_literal: true

module Api
  module Administration
    class ReflectionQuestionPolicy < ::Api::Administration::BasePolicy
      def index?
        has_permission?('reflection_questions', 'view', project_id: project_id)
      end

      def create?
        has_permission?('reflection_questions', 'manage', project_id: project_id)
      end

      def update?
        has_permission?('reflection_questions', 'manage', project_id: project_id)
      end

      def destroy?
        has_permission?('reflection_questions', 'manage', project_id: project_id)
      end

      def show?
        has_permission?('reflection_questions', 'view', project_id: project_id)
      end

      def import?
        has_permission?('reflection_questions', 'import', project_id: project_id)
      end

      def export?
        has_permission?('reflection_questions', 'export', project_id: project_id)
      end

      class Scope < BasePolicy::Scope
        def resolve
          scope.where(project_id: project_id).includes(:idp_template_reflection_questions).eager_load(:translations)
        end
      end
    end
  end
end
