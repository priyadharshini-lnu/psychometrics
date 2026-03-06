# frozen_string_literal: true

class AddParentFactorIdAndScoringTypeToAIFactorScores < ActiveRecord::Migration[7.0]
  def change
    add_reference :ai_factor_scores, :parent_factor, foreign_key: { to_table: :factors }
    add_column :ai_factor_scores, :scoring_type, :integer, default: 0
  end
end
