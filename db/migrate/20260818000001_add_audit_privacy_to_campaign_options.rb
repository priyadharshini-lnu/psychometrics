# frozen_string_literal: true

class AddAuditPrivacyToCampaignOptions < ActiveRecord::Migration[7.1]
  def change
    change_table :campaign_options, bulk: true do |t|
      t.boolean :hide_participant_video, default: false, null: false
      t.boolean :disable_transcript_download, default: false, null: false
    end
  end
end
