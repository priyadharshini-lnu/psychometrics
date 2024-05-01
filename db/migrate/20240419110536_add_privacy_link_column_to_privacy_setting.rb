class AddPrivacyLinkColumnToPrivacySetting < ActiveRecord::Migration[7.1]
  def change
    add_column :privacy_settings, :enable_privacy_link, :boolean, default: false
  end
end
