# frozen_string_literal: true

class AddPreworkToCampaignAssessments < ActiveRecord::Migration[6.1]
  def change
    add_column :campaign_assessments, :prework, :boolean, default: false
  end
end
