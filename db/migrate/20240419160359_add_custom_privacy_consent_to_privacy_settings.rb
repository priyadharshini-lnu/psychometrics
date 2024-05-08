class AddCustomPrivacyConsentToPrivacySettings < ActiveRecord::Migration[7.1]
  def change
    add_column :privacy_settings, :custom_privacy_consent, :boolean, default: false
  end
end
