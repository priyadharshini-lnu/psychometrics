# frozen_string_literal: true

class CreateIihtAssessmentSettings < ActiveRecord::Migration[5.2]
  def change
    create_table :iiht_assessment_settings do |t|
      t.references :assessment, null: false, foreign_key: { on_delete: :cascade }
      t.string :iiht_assessment_name

      t.timestamps
    end
  end
end
