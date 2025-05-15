# frozen_string_literal: true

module Api
  module Administration
    class IdpTemplatePolicy < ::Api::Administration::BasePolicy
      def index?
        has_permission?(:idp_templates, :view)
      end

      def create?
        has_permission?(:idp_templates, :manage)
      end

      def update?
        has_permission?(:idp_templates, :manage)
      end

      def destroy?
        has_permission?(:idp_templates, :manage)
      end

      def uploads?
        has_permission?(:idp_templates, :manage)
      end

      class Scope < Api::Administration::BasePolicy::Scope
        def resolve
          scope.where(project_id: project_id)
        end
      end
    end
  end
end
