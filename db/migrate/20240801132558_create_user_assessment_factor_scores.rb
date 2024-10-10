# frozen_string_literal: true

class CreateUserAssessmentFactorScores < ActiveRecord::Migration[7.1]
  def change
    create_table :user_assessment_factor_scores do |t|
      t.references :user_assessment, foreign_key: { on_delete: :cascade }, null: false
      t.references :factor, foreign_key: { on_delete: :restrict }, null: false
      t.jsonb :scores, default: {}

      t.timestamps
    end
  end
end
