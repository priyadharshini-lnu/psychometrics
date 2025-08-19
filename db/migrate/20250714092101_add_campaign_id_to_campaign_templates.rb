# frozen_string_literal: true

class AddCampaignIdToCampaignTemplates < ActiveRecord::Migration[7.1]
  def change
    add_reference :campaign_templates, :campaign, foreign_key: true, null: true
  end
end
