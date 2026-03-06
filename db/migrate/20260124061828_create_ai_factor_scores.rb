# frozen_string_literal: true

class CreateAIFactorScores < ActiveRecord::Migration[8.0]
  def change
    create_table :ai_factor_scores do |t|
      t.references :users_result, null: false, foreign_key: true
      t.references :question, null: true, foreign_key: true
      t.references :factor, null: false, foreign_key: true
      t.float :score
      t.float :override_score
      t.float :confidence
      t.jsonb :citations
      t.text :rationale
      t.integer :status, default: 0
      t.timestamps
    end
  end
end
