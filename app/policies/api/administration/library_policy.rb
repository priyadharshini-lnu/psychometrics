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
        has_permission?(:libraries, :manage, project_id: project_id)
      end
    end
  end
end
