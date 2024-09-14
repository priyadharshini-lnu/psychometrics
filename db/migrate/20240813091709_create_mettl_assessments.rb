# frozen_string_literal: true

class CreateMettlAssessments < ActiveRecord::Migration[7.1]
  def change
    create_table :mettl_assessments do |t|
      t.string :product_id, null: false
      t.string :name, null: false
      t.integer :duration
      t.text :instructions
      t.text :default_instructions
      t.jsonb :registration_fields

      t.references :project, foreign_key: { to_table: :clients, on_delete: :cascade }

      t.timestamps
    end

    add_index :mettl_assessments, :product_id, unique: true
  end
end
