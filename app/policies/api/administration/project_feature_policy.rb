# frozen_string_literal: true

module Api
  module Administration
    class ProjectFeaturePolicy < Administration::BasePolicy
      def update?
        has_permission?(:project_settings, :feature_flags, project_id: project_id)
      end

      def index?
        has_permission?(:project_settings, :feature_flags, project_id: project_id)
      end
    end
  end
end
