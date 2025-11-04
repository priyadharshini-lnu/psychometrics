# frozen_string_literal: true

class AddYoodliPrivacySettingToPrivacySettings < ActiveRecord::Migration[7.1]
  def change
    add_column :privacy_settings, :mask_identity_for_yoodli, :boolean, default: false
  end
end
