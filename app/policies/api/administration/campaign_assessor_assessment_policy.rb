# frozen_string_literal: true

module Api
  module Administration
    class CampaignAssessorAssessmentPolicy < BasePolicy
      def index?
        has_permission?(:assessors, :view) || @user.is?(:assessor)
      end

      def create?
        has_permission?(:assessors, :manage)
      end

      def update?
        has_permission?(:assessors, :manage)
      end

      def destroy?
        has_permission?(:assessors, :manage)
      end

      def subject_assessor_assessments?
        has_permission?(:workshops, :manage)
      end
    end
  end
end
