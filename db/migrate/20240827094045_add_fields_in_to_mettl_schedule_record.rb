# frozen_string_literal: true

class AddFieldsInToMettlScheduleRecord < ActiveRecord::Migration[7.1]
  def change
    change_table :mettl_schedule_records, bulk: true do |t|
      t.bigint :duplicated_from_id
      t.integer :schedule_number, default: 1
    end
  end
end
