# frozen_string_literal: true

module UserAssessments
  class NormalizeFactorScores < BaseCommand
    ALLOWED_KEYS = %w[
      score
      zscore
      norm_score
      percentage
      total_questions
      questions_attempted
      questions_correct
      questions_partial_correct
      questions_incorrect
      questions_not_attempted
    ].freeze

    private_attr_reader :user_assessment, :users_result

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @users_result = user_assessment.users_result
    end

    def call
      return broadcast :non_normalizable_user_assessment unless user_assessment.normalize_factor_scores?
      return broadcast :no_scoring_data if users_result.scoring.nil?

      ApplicationRecord.transaction do
        user_assessment_scores = users_result.scoring.map do |factor_id, scores|
          UserAssessmentFactorScore.new(
            user_assessment_id: user_assessment.id,
            factor_id: factor_id,
            scores: scores.slice(*ALLOWED_KEYS),
            tenant_id: user_assessment.tenant_id
          )
        end
        UserAssessmentFactorScore.import(
          user_assessment_scores, validate: false, on_duplicate_key_update: %i[user_assessment_id factor_id]
        )
        scored_factor_ids = user_assessment.user_assessment_factor_scores.pluck(:factor_id).map(&:to_s)
        factor_ids_to_delete = users_result.scoring.keys - scored_factor_ids
        user_assessment.user_assessment_factor_scores.where(factor_id: factor_ids_to_delete).delete_all
      end

      broadcast :ok
    end
  end
end
