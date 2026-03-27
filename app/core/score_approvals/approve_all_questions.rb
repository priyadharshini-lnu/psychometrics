# frozen_string_literal: true

module ScoreApprovals
  class ApproveAllQuestions < ApproveQuestion
    private_attr_reader :current_user, :score_approval, :question_id, :bulk_scoring_approval

    def initialize(score_approval, current_user, bulk_scoring_approval: false)
      @score_approval = score_approval
      @current_user = current_user
      @bulk_scoring_approval = bulk_scoring_approval
    end

    private

    def allow_to_approve?
      return true if bulk_scoring_approval

      policy.approve_all_questions?
    end

    def question_scores
      @question_scores ||= users_result.ai_factor_scores.where.not(scoring_type: :aggregated)
    end
  end
end
