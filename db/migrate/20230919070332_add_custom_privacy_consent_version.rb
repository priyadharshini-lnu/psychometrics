class AddCustomPrivacyConsentVersion < ActiveRecord::Migration[6.1]
  def change
    add_column :clients, :custom_privacy_policy_version, :integer, default: nil
    add_column :privacy_consents, :policy_type, :integer, default: 0
  end
end
