# frozen_string_literal: true

class AddCachingEnabledToCampaignAssessment < ActiveRecord::Migration[8.0]
  def change
    add_column :campaign_assessments, :caching_enabled, :boolean, default: false
  end
end
