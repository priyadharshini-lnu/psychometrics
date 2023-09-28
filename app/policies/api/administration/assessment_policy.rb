# frozen_string_literal: true

module Api
  module Administration
    class AssessmentPolicy < ::Administration::AssessmentPolicy
      def show?
        @user.has_permission?(:assessments, :manage, project_id: record.owner_id)
      end

      def toggle_archive?
        show?
      end

      def restore?
        show?
      end

      def copy?
        show?
      end

      def manage?
        show?
      end
    end
  end
end
