# frozen_string_literal: true

module Api
  module Administration
    class UserPolicy < Api::Administration::BasePolicy
      def show?
        @user.is?(:superadmin) || @user.has_grant?(:projects, :manage_users)
      end
    end
  end
end
