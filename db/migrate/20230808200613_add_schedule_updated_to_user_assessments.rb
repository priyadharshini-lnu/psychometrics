class AddScheduleUpdatedToUserAssessments < ActiveRecord::Migration[7.0]
  def change
    add_column :user_assessments, :schedule_updated, :boolean, default: false
  end
end
