class AddAndRenameColumnForEmailSchedule < ActiveRecord::Migration[5.1]
  def change
    rename_column :threesixty_email_schedules, :recipient_emails, :recipient_ids
    add_column :threesixty_email_schedules, :meta, :jsonb, default: {}
  end
end
