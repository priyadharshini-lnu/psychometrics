# frozen_string_literal: true

class UpdateNormalizedScoreView < ActiveRecord::Migration[7.1]
  def up
    execute('DROP VIEW IF EXISTS normalized_factor_scores')
    execute("
      CREATE OR REPLACE VIEW normalized_factor_scores AS
        SELECT user_assessment_factor_scores.id,
          user_assessment_factor_scores.factor_id,
          user_assessment_factor_scores.user_assessment_id,
          (user_assessment_factor_scores.scores ->> 'norm_score')::float AS norm_score,
          (user_assessment_factor_scores.scores ->> 'score')::float AS score,
          (user_assessment_factor_scores.scores ->> 'zscore')::float AS zscore,
          (user_assessment_factor_scores.scores ->> 'percentage')::float AS percentage
        FROM user_assessment_factor_scores;
    ")
  end
end
