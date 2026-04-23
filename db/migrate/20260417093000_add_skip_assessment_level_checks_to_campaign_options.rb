# frozen_string_literal: true

class AddSkipAssessmentLevelChecksToCampaignOptions < ActiveRecord::Migration[7.0]
  def change
    add_column :campaign_options, :skip_assessment_level_checks, :boolean, default: true, null: false
  end
end
