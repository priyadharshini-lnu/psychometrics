# frozen_string_literal: true

module Api
  module Administration
    class UserPolicy < ::Administration::UserPolicy
      def show?
        @user.is?(:superadmin) || @user.has_grant?(:projects, :manage_users)
      end

      class Scope < Scope
        def resolve
          ::Administration::UserPolicy::Scope.new(user, ::User).resolve
        end
      end
    end
  end
end
