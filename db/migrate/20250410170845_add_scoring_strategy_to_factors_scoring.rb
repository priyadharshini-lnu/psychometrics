# frozen_string_literal: true

class AddScoringStrategyToFactorsScoring < ActiveRecord::Migration[7.1]
  def change
    add_column :factors_scoring, :scoring_strategy, :integer, default: 0
  end
end
