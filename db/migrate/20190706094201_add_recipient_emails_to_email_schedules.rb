class AddRecipientEmailsToEmailSchedules < ActiveRecord::Migration[5.1]
  def change
    add_column :threesixty_email_schedules, :recipient_emails, :jsonb, default: []
  end
end
