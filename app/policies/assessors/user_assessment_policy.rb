# frozen_string_literal: true

module Assessors
  class UserAssessmentPolicy < BasePolicy
    def index?
      @user.is?(:assessor)
    end

    def evaluate?
      @user.is?(:assessor)
    end

    def show?
      @user.is?(:assessor)
    end

    def new_response?
      @user.is?(:assessor) && !@record.campaign.user_assessments.
        where(evaluator_id: @user.id, subject_id: @record.subject_id, assessment_id: @record.assessment_id).
        where.not(status: :completed).exists?
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
