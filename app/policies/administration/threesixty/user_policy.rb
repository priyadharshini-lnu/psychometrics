# frozen_string_literal: true

module Administration
  module Threesixty
    class UserPolicy < Administration::Threesixty::BasePolicy
      def update?
        has_permission?(:campaigns, :manage_users)
      end
    end
  end
end
