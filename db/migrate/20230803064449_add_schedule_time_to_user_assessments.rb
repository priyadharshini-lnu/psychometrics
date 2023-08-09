class AddScheduleTimeToUserAssessments < ActiveRecord::Migration[7.0]
  def change
    add_column :user_assessments, :schedule_time, :datetime
  end
end
