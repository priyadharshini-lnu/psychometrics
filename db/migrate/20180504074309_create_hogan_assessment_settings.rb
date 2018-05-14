class CreateHoganAssessmentSettings < ActiveRecord::Migration[5.1]
  def change
    create_table :hogan_assessment_settings do |t|
      t.string :hogan_assessment_id, null: :false
      t.string :hogan_form_id, null: false
      t.references :assessment, null: false, foreign_key: { on_delete: :cascade }

      t.timestamps
    end
  end
end
