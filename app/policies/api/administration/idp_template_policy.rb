# frozen_string_literal: true

module Api
  module Administration
    class IdpTemplatePolicy < ::Api::Administration::BasePolicy
      def index?
        @user.has_grant?(:idp_templates, :view)
      end

      class Scope < Api::Administration::BasePolicy::Scope
        def resolve
          return scope if @user.is?(:superadmin)

          scope.where(owner_id: project_id)
        end
      end
    end
  end
end
