# frozen_string_literal: true

module Assessors
  class UserPolicy < BasePolicy
    def dashboard?
      @user.is?(:assessor)
    end

    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user = user
        @scope = [scope].flatten.last
      end

      def resolve
        scope.joins(:user_assessments).where(user_assessments: { evaluator: user })
      end
    end
  end
end
