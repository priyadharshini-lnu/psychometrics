# frozen_string_literal: true

class CreateSavilleAssessmentSettings < ActiveRecord::Migration[5.2]
  def change
    create_table :saville_assessment_settings do |t|
      t.references :assessment, null: false, foreign_key: { on_delete: :cascade }
      t.string :saville_assessment_id, null: false
      t.string :saville_norm_id, null: false

      t.timestamps
    end
  end
end
