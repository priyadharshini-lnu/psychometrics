# frozen_string_literal: true

class AddWebProctoringSettingsToMettlScheduleRecord < ActiveRecord::Migration[7.1]
  def change
    add_column :mettl_schedule_records, :web_proctoring_settings, :jsonb, default: {
      enabled: false,
      count: 5,
      show_remaining_counts: false
    }
  end
end
