# frozen_string_literal: true

module Api
  module Administration
    class ProjectAssessmentPolicy < ::Api::Administration::BasePolicy
      def index?
        has_permission?(:project_settings, :assessments)
      end

      def create?
        has_permission?(:project_settings, :assessments)
      end

      def update?
        has_permission?(:project_settings, :assessments)
      end

      def destroy?
        has_permission?(:project_settings, :assessments)
      end

      class Scope < Api::Administration::BasePolicy::Scope
        def resolve
          super.where(project_id: project_id)
        end
      end
    end
  end
end
