# frozen_string_literal: true

class AddVisualProctoringEnabledToMettlScheduleRecord < ActiveRecord::Migration[7.1]
  def change
    add_column :mettl_schedule_records, :visual_proctoring_settings, :jsonb, default: {
      enabled: false,
      candidate_screen_capture: false,
      candidate_authorization: false
    }
  end
end
