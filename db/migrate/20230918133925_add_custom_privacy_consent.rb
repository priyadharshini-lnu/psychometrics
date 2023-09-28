# frozen_string_literal: true

class AddCustomPrivacyConsent < ActiveRecord::Migration[6.1]
  def up
    add_column :clients, :custom_privacy_consent, :boolean, default: false
    add_column :clients, :custom_privacy_consent_text, :text
  end

  def down
    remove_column :clients, :custom_privacy_consent
    remove_column :clients, :custom_privacy_consent_text
  end
end
