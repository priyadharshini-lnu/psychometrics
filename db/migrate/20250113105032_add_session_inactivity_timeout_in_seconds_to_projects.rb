# frozen_string_literal: true

class AddSessionInactivityTimeoutInSecondsToProjects < ActiveRecord::Migration[7.1]
  def change
    add_column :security_settings, :session_inactivity_timeout_in_seconds, :integer, default: 120.minutes.to_i,
null: false
  end
end
