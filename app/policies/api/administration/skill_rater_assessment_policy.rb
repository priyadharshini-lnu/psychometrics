# frozen_string_literal: true

module Api
  module Administration
    class SkillRaterAssessmentPolicy < BasePolicy
      def import_taxonomies?
        @user.is?(:superadmin, :client_admin, :project_admin)
      end
    end
  end
end
