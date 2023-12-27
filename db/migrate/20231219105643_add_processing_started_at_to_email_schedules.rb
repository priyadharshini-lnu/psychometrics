class AddProcessingStartedAtToEmailSchedules < ActiveRecord::Migration[7.0]
  def change
    add_column :threesixty_email_schedules, :processing_started_at, :datetime
  end
end
