# frozen_string_literal: true

module Api
  module Administration
    class IdpTemplatePolicy < ::Api::Administration::BasePolicy
      def index?
        @user.has_grant?(:idp_templates, :view)
      end

      def create?
        @user.has_grant?(:idp_templates, :manage)
      end

      def update?
        @user.has_grant?(:idp_templates, :manage)
      end

      def destroy?
        @user.has_grant?(:idp_templates, :manage)
      end

      class Scope < Api::Administration::BasePolicy::Scope
        def resolve
          scope.where(project_id: project_id)
        end
      end
    end
  end
end
