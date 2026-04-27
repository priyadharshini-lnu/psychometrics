# frozen_string_literal: true

class AddCustomPrivacyAcknowledgmentTextToPrivacySettingTranslations < ActiveRecord::Migration[8.0]
  def change
    add_column :privacy_setting_translations, :custom_privacy_acknowledgment_text, :text
  end
end
