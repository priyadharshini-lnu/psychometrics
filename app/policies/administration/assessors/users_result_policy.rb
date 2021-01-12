# frozen_string_literal: true

module Administration::Assessors
  class UsersResultPolicy < ::BasePolicy
    def update?
      @user.is?(:assessor)
    end

    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user = user
        @scope = [scope].flatten.last
      end

      def resolve
        scope
      end
    end
  end
end
