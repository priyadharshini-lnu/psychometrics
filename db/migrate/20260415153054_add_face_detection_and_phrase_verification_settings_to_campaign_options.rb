# frozen_string_literal: true

class AddFaceDetectionAndPhraseVerificationSettingsToCampaignOptions < ActiveRecord::Migration[8.0]
  def change
    change_table :campaign_options, bulk: true do |t|
      t.boolean :face_detection_enabled, default: false, null: false
      t.integer :minimum_face_detection_ratio, default: 85
      t.boolean :phrase_verification_enabled, default: false, null: false
    end
  end
end
