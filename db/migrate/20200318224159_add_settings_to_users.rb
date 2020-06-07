# frozen_string_literal: true

class AddSettingsToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :settings, :jsonb, default: {}
  end
end
