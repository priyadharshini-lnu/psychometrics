# frozen_string_literal: true

class AddMaskIdentityForMhsToPrivacySettings < ActiveRecord::Migration[8.0]
  def change
    add_column :privacy_settings, :mask_identity_for_mhs, :boolean, default: false, null: false
  end
end
