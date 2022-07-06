# frozen_string_literal: true

module Api
  module Administration
    class UserPolicy < ::Administration::UserPolicy
      def show?
        @user.is?(:superadmin) || @user.has_grant?(:projects, :manage_users)
      end

      class Scope < ::Administration::UserPolicy::Scope
      end
    end
  end
end
