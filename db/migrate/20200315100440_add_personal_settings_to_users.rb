# frozen_string_literal: true

class AddPersonalSettingsToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :personal_settings, :jsonb, default: {}
  end
end
