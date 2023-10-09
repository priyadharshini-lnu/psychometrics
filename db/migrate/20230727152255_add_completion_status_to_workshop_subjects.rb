class AddCompletionStatusToWorkshopSubjects < ActiveRecord::Migration[7.0]
  def change
    add_column :workshop_subjects, :completion_status, :integer, default: 0, null: false # not_started, completed
    rename_column :workshop_subjects, :status, :attendance_status
  end
end
