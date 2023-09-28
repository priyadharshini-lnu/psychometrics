class RemoveAssessmentSettings < ActiveRecord::Migration[6.1]
  def change
    drop_table :hogan_assessment_settings do |t|
      t.string :hogan_assessment_id
      t.string :hogan_form_id, null: false
      t.integer :assessment_id, null: false
      t.timestamps null: false
    end

    drop_table :iiht_assessment_settings do |t|
      t.integer :assessment_id, null: false
      t.string :iiht_assessment_id_number
      t.jsonb :iiht_schedule_config, default: {}
      t.timestamps null: false
    end

    drop_table :pearson_assessment_settings do |t|
      t.integer :assessment_id, null: false
      t.string :pearson_assessment_id, null: false
      t.string :pearson_norm_id, null: false
      t.timestamps null: false
    end

    drop_table :saville_assessment_settings do |t|
      t.integer :assessment_id, null: false
      t.string :saville_assessment_id, null: false
      t.string :saville_norm_id, null: false
      t.timestamps null: false
    end
  end
end
