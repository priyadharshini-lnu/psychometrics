# frozen_string_literal: true

module Api
  module Administration
    class DirectUploadPolicy < BasePolicy
      def create?
        has_permission?(:libraries, :manage, project_id: project_id || user&.project_id)
      end
    end
  end
end
