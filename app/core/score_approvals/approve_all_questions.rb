# frozen_string_literal: true

module ScoreApprovals
  class ApproveAllQuestions < ApproveQuestion
    private_attr_reader :current_user, :score_approval, :question_id

    def initialize(score_approval, current_user)
      @score_approval = score_approval
      @current_user = current_user
    end

    private

    def allow_to_approve?
      policy.approve_all_questions?
    end

    def question_scores
      @question_scores ||= users_result.ai_factor_scores.where.not(scoring_type: :aggregated)
    end
  end
end
