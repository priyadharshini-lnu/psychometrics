# frozen_string_literal: true

class AddAvailableLocalesToCampaignAssessment < ActiveRecord::Migration[5.2]
  def change
    add_column :campaign_assessments, :available_locales, :text, array: true, default: []
  end
end
