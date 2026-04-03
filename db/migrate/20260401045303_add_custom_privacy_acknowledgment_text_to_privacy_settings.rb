# frozen_string_literal: true

class AddCustomPrivacyAcknowledgmentTextToPrivacySettings < ActiveRecord::Migration[8.0]
  def change
    add_column :privacy_settings, :custom_privacy_acknowledgment_text, :text
  end
end
