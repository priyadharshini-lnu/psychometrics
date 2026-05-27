# frozen_string_literal: true

class AddDisallowLeadAssessorModerationToCampaignFactors < ActiveRecord::Migration[8.0]
  def change
    add_column :campaign_factors, :disallow_lead_assessor_moderation, :boolean, default: false, null: false
  end
end
