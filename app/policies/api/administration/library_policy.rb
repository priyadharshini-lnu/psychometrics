# frozen_string_literal: true

module Api
  module Administration
    class LibraryPolicy < ::Administration::LibraryPolicy
      def create_from_upload?
        create?
      end

      def update?
        has_permission?(:libraries, :manage, project_id: project_id)
      end

      def destroy?
        return has_permission?(:libraries, :manage, project_id: project_id) if project_id.present?

        user.has_grant?(:libraries, :manage)
      end
    end
  end
end
