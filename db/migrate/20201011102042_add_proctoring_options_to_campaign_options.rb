# frozen_string_literal: true

class AddProctoringOptionsToCampaignOptions < ActiveRecord::Migration[5.1]
  def change
    add_column :campaign_options, :proctoring_enabled, :boolean, default: false
    add_column :campaign_options, :identification, :integer, default: 0
    add_column :campaign_options, :rules, :jsonb, default: {
      allow_to_use_websites: false,
      allow_to_use_books: false,
      allow_to_use_paper: true,
      allow_to_use_messengers: false,
      allow_to_use_calculator: true,
      allow_to_use_excel: false,
      allow_to_use_human_assistant: false,
      allow_absence_in_frame: false,
      allow_voices: false,
      allow_wrong_gaze_direction: false,
      custom_rules: ''
    }
  end
end
