# frozen_string_literal: true

class AddUniqueConstraintAndIndexesToAIFactorScores < ActiveRecord::Migration[8.0]
  def change
    add_index :ai_factor_scores,
              %i[users_result_id factor_id question_id],
              unique: true,
              where: 'question_id IS NOT NULL',
              name: 'idx_ai_factor_scores_unique_with_question'

    add_index :ai_factor_scores,
              %i[users_result_id factor_id],
              unique: true,
              where: 'question_id IS NULL',
              name: 'idx_ai_factor_scores_unique_aggregated'
  end
end
