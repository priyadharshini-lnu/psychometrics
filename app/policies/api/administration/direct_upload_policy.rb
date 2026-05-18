# frozen_string_literal: true

module Api
  module Administration
    class DirectUploadPolicy < BasePolicy
      def create?
        return has_permission?(:libraries, :manage, project_id: project_id) if project_id.present?

        user.has_grant?(:libraries, :manage)
      end
    end
  end
end
