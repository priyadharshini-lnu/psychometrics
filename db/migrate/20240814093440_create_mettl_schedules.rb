# frozen_string_literal: true

class CreateMettlSchedules < ActiveRecord::Migration[7.1]
  def change
    create_table :mettl_schedules do |t|
      t.references :project, foreign_key: { to_table: :clients, on_delete: :cascade }
      t.references :assessment, null: false, foreign_key: { on_delete: :cascade }

      t.integer :schedule_id, null: false
      t.string :schedule_name
      t.string :access_key
      t.string :access_url

      t.timestamps
    end
  end
end
