# frozen_string_literal: true

class AddCampaignFactorsListToAssessments < ActiveRecord::Migration[7.1]
  def change
    add_column :assessments, :campaign_factors_list, :jsonb, default: []
  end
end
