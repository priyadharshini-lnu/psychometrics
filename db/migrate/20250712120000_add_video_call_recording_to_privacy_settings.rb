# frozen_string_literal: true

class AddVideoCallRecordingToPrivacySettings < ActiveRecord::Migration[7.1]
  def change
    change_table :privacy_settings, bulk: true do |t|
      t.boolean :allow_video_call_recording, default: false, null: false
      t.boolean :enable_video_call_recording_for_all_new_campaigns, default: false, null: false
      t.integer :video_call_recording_expiry_in_seconds
    end
  end
end
