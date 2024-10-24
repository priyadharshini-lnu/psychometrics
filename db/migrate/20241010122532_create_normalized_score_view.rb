# frozen_string_literal: true

class CreateNormalizedScoreView < ActiveRecord::Migration[7.1]
  def up
    # execute("
    #   CREATE OR REPLACE VIEW normalized_factor_scores AS
    #     SELECT user_assessment_factor_scores.id,
    #       user_assessment_factor_scores.factor_id,
    #       user_assessment_factor_scores.user_assessment_id,
    #       user_assessment_factor_scores.scores ->> 'norm_score'::text AS norm_score,
    #       user_assessment_factor_scores.scores ->> 'score'::text AS score,
    #       user_assessment_factor_scores.scores ->> 'zscore'::text AS zscore,
    #       user_assessment_factor_scores.scores ->> 'percentage'::text AS percentage
    #     FROM user_assessment_factor_scores;
    # ")
  end

  def down
    # execute("DROP VIEW normalized_factor_scores")
  end
end
