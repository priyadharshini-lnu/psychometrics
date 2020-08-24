# frozen_string_literal: true

class AddNormTypeToCampaignAssessments < ActiveRecord::Migration[5.1]
  def change
    add_column :campaign_assessments, :norm_type, :string
  end
end
