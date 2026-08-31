# frozen_string_literal: true

class AddPrivacyLinkTextToPrivacySettingTranslations < ActiveRecord::Migration[8.0]
  def change
    add_column :privacy_setting_translations, :privacy_link_text, :string
  end
end
