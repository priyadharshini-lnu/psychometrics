# frozen_string_literal: true

class CreateMaintenanceSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :maintenance_settings do |t|
      t.integer :sub_system, null: false
      t.boolean :maintenance_window_enabled, null: false, default: false
      t.string :time_zone, null: false
      t.datetime :start_time, null: false
      t.datetime :end_time, null: false
      t.timestamps
    end
  end
end
