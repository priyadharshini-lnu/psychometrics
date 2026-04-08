# frozen_string_literal: true

class CreateSystemCheckRecords < ActiveRecord::Migration[8.0]
  def change
    create_table :system_check_records do |t|
      t.references :system_check_session, null: false, foreign_key: true
      t.string :check_type, null: false
      t.boolean :passed, null: false, default: false
      t.jsonb :data
      t.datetime :finished_at

      t.timestamps
    end
  end
end
