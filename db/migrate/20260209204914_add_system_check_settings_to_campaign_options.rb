# frozen_string_literal: true

class AddSystemCheckSettingsToCampaignOptions < ActiveRecord::Migration[8.0]
  def change
    change_table :campaign_options, bulk: true do |t|
      t.boolean :system_check_enabled, default: false, null: false
      t.integer :system_check_validity
      t.boolean :allow_continue_with_warning, default: false, null: false
      t.integer :minimum_upload_speed
      t.integer :minimum_download_speed
    end
  end
end
