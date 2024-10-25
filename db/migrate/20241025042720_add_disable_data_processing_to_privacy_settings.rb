# frozen_string_literal: true

class AddDisableDataProcessingToPrivacySettings < ActiveRecord::Migration[7.1]
  def change
    add_column :privacy_settings, :disable_data_processing, :boolean, default: false
  end
end
