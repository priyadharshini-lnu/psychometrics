# frozen_string_literal: true

class ChangeDefaultPrivacyConsentToTrueInPrivacySettings < ActiveRecord::Migration[7.1]
  def change
    change_column_default :privacy_settings, :privacy_consent, from: false, to: true
  end
end
