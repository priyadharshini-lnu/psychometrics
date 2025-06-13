# frozen_string_literal: true

class CreateSkillvueAssessment < ActiveRecord::Migration[7.1]
  def change
    create_table :skillvue_assessments do |t|
      t.string :product_id, null: false
      t.string :name, null: false
      t.string :iso_code
      t.date :expiration
      t.references :project, foreign_key: { to_table: :clients, on_delete: :cascade }

      t.timestamps
    end

    add_index :skillvue_assessments, :product_id, unique: true
  end
end
