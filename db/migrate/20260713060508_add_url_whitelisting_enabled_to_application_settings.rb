# frozen_string_literal: true

class AddUrlWhitelistingEnabledToApplicationSettings < ActiveRecord::Migration[8.0]
  def change
    add_column :application_settings, :url_whitelisting_enabled, :boolean, null: false, default: false
  end
end
