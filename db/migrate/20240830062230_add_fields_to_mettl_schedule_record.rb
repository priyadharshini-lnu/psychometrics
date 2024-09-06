# frozen_string_literal: true

class AddFieldsToMettlScheduleRecord < ActiveRecord::Migration[7.1]
  def change
    change_table :mettl_schedule_records, bulk: true do |t|
      t.boolean :proctoring_enabled, default: false
      t.boolean :secure_browser_enabled, default: false
    end
  end
end
