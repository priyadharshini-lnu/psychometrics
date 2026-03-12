# frozen_string_literal: true

class AddAIScoringConfigToFactorsScoring < ActiveRecord::Migration[8.0]
  def change
    add_column :factors_scoring, :ai_scoring_config, :jsonb
  end
end
