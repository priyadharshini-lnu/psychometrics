# frozen_string_literal: true

class RenameMettlSchedule < ActiveRecord::Migration[7.1]
  def up
    rename_table :mettl_schedules, :mettl_schedule_records
    rename_column :mettl_user_assessments, :mettl_schedule_id, :mettl_schedule_record_id
  end

  def down
    rename_table :mettl_schedule_records, :mettl_schedules
    rename_column :mettl_user_assessments, :mettl_schedule_record_id, :mettl_schedule_id
  end
end
