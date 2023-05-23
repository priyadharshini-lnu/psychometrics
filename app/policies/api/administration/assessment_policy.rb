# frozen_string_literal: true

module Api
  module Administration
    class AssessmentPolicy < ::Administration::AssessmentPolicy
      def show?
        @user.has_permission?(:assessments, :manage, project_id: project_id)
      end
    end
  end
end
