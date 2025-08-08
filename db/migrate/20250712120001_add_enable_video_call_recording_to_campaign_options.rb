# frozen_string_literal: true

class AddEnableVideoCallRecordingToCampaignOptions < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_options, :enable_video_call_recording, :boolean, default: false, null: false
  end
end
