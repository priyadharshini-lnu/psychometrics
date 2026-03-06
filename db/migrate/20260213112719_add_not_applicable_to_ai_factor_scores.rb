# frozen_string_literal: true

class AddNotApplicableToAIFactorScores < ActiveRecord::Migration[8.0]
  def change
    add_column :ai_factor_scores, :not_applicable, :boolean, default: false
  end
end
