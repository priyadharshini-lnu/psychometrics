# frozen_string_literal: true

module Assessors
  class UserAssessmentPolicy < BasePolicy
    def show?
      @user.is?(:assessor)
    end

    def subject_assessment?
      @user.is?(:assessor)
    end

    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user = user
        @scope = [scope].flatten.last
      end

      def resolve
        scope.joins(:campaign).where(evaluator_id: @user.id)
      end
    end
  end
end
