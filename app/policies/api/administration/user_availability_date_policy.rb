# frozen_string_literal: true

module Api
  module Administration
    class UserAvailabilityDatePolicy < ::Administration::BasePolicy
      def index?
        @user.admin?
      end

      def create?
        @user.admin?
      end

      def update?
        @user.admin?
      end

      class Scope < BasePolicy::Scope
        def resolve
          scope.where(user_id: user.id)
        end
      end
    end
  end
end
