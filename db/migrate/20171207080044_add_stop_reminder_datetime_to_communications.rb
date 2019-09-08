# frozen_string_literal: true

class AddStopReminderDatetimeToCommunications < ActiveRecord::Migration[5.0]
  def change
    add_column :communications, :stop_reminder_datetime, :datetime
  end
end
