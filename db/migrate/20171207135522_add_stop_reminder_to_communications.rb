class AddStopReminderToCommunications < ActiveRecord::Migration[5.0]
  def change
    add_column :communications, :stop_reminder, :boolean, default: false, null: false
  end
end
