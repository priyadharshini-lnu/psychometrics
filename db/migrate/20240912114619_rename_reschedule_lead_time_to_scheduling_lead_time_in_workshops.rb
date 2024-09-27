# frozen_string_literal: true

class RenameRescheduleLeadTimeToSchedulingLeadTimeInWorkshops < ActiveRecord::Migration[6.1]
  def change
    rename_column :workshops, :reschedule_lead_time, :scheduling_lead_time
  end
end
