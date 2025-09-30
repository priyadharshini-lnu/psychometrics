# frozen_string_literal: true

class AddDigestConfigFieldsToCommunications < ActiveRecord::Migration[7.1]
  def change
    change_table :communications, bulk: true do |t|
      t.date   :delivery_start_date
      t.date   :delivery_end_date
      t.time   :delivery_time_of_day
      t.string :delivery_timezone
      t.string :delivery_frequency
      t.string :delivery_weekdays, array: true, default: []
    end
  end
end
