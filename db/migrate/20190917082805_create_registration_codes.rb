# frozen_string_literal: true

class CreateRegistrationCodes < ActiveRecord::Migration[5.1]
  def change
    enable_extension('citext')
    create_table :registration_codes do |t|
      t.string :name
      t.citext :code
      t.integer :total_count, null: false
      t.integer :use_count, default: 0
      t.integer :end_level_id
      t.integer :project_id
      t.datetime :start_date
      t.datetime :end_date
      t.boolean :disabled, default: true
      t.timestamps
    end
    add_index :registration_codes, %i[project_id code], unique: true
    add_index :registration_codes, %i[end_level_id code], unique: true
  end
end
