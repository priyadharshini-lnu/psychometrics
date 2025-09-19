# frozen_string_literal: true

class AddQuestionCountsToNormalizedFactorScores < ActiveRecord::Migration[7.1]
  def up
    execute <<-SQL.squish
      CREATE OR REPLACE VIEW bi_models.normalized_factor_scores AS
        SELECT
          user_assessment_factor_scores.id,
          campaigns.project_id,
          campaigns.id as campaign_id,
          user_assessment_factor_scores.user_assessment_id,
          user_assessment_factor_scores.factor_id,
          (user_assessment_factor_scores.scores ->> 'norm_score')::float AS norm_score,
          (user_assessment_factor_scores.scores ->> 'score')::float AS score,
          (user_assessment_factor_scores.scores ->> 'zscore')::float AS zscore,
          (user_assessment_factor_scores.scores ->> 'percentage')::float AS percentage,
          (user_assessment_factor_scores.scores ->> 'total_questions')::int AS total_questions,
          (user_assessment_factor_scores.scores ->> 'questions_attempted')::int AS questions_attempted,
          (user_assessment_factor_scores.scores ->> 'questions_correct')::int AS questions_correct,
          (user_assessment_factor_scores.scores ->> 'questions_partial_correct')::int AS questions_partial_correct,
          (user_assessment_factor_scores.scores ->> 'questions_incorrect')::int AS questions_incorrect,
          (user_assessment_factor_scores.scores ->> 'questions_not_attempted')::int AS questions_not_attempted
        FROM
          user_assessment_factor_scores
          JOIN user_assessments ON user_assessments.id = user_assessment_factor_scores.user_assessment_id
          JOIN campaigns ON campaigns.id = user_assessments.campaign_id
    SQL
  end

  def down
    execute <<-SQL.squish
      CREATE OR REPLACE VIEW bi_models.normalized_factor_scores AS
        SELECT
          user_assessment_factor_scores.id,
          campaigns.project_id,
          campaigns.id as campaign_id,
          user_assessment_factor_scores.user_assessment_id,
          user_assessment_factor_scores.factor_id,
          (user_assessment_factor_scores.scores ->> 'norm_score')::float AS norm_score,
          (user_assessment_factor_scores.scores ->> 'score')::float AS score,
          (user_assessment_factor_scores.scores ->> 'zscore')::float AS zscore,
          (user_assessment_factor_scores.scores ->> 'percentage')::float AS percentage
        FROM
          user_assessment_factor_scores
          JOIN user_assessments ON user_assessments.id = user_assessment_factor_scores.user_assessment_id
          JOIN campaigns ON campaigns.id = user_assessments.campaign_id
    SQL
  end
end
