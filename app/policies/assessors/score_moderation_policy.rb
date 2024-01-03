# frozen_string_literal: true

module Assessors
  class ScoreModerationPolicy < BasePolicy
    def show?
      @user.is?(:assessor) && lead_assessor?
    end

    def assessor_assessments?
      @user.is?(:assessor) && lead_assessor?
    end

    def reports?
      @user.is?(:assessor) && lead_assessor?
    end

    def assessment_with_results?
      @user.is?(:assessor) && lead_assessor?
    end

    def lead_assessor?
      Users::GetLeadAssessor.call!(@extra[:campaign], @record) == @user
    end
  end
end
