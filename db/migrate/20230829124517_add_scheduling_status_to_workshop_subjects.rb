class AddSchedulingStatusToWorkshopSubjects < ActiveRecord::Migration[7.0]
  def change
    add_column :workshop_subjects, :scheduling_status, :integer, default: 0
  end
end
