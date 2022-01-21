# frozen_string_literal: true

class CreatePearsonAssessmentSettings < ActiveRecord::Migration[5.2]
  def change
    create_table :pearson_assessment_settings do |t|
      t.references :assessment, null: false, foreign_key: { on_delete: :cascade }
      t.string :pearson_assessment_id, null: false
      t.string :pearson_norm_id, null: false

      t.timestamps
    end
  end
end
