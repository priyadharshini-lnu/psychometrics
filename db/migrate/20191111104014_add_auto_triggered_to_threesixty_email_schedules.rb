# frozen_string_literal: true

class AddAutoTriggeredToThreesixtyEmailSchedules < ActiveRecord::Migration[5.1]
  def change
    add_column :threesixty_email_schedules, :auto_triggered, :boolean, default: true
  end
end
