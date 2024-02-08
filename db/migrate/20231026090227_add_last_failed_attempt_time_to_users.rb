# frozen_string_literal: true

class AddLastFailedAttemptTimeToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :last_unsuccessful_attempt, :timestamp
  end
end
