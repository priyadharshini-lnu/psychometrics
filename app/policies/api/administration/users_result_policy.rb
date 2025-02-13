# frozen_string_literal: true

module Api
  module Administration
    class UsersResultPolicy < ::Administration::BasePolicy
      def show?
        @user.is?(:superadmin)
      end
    end
  end
end
