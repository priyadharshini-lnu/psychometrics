# frozen_string_literal: true

class AddSavilleNormIdToCampaignAssessment < ActiveRecord::Migration[5.2]
  def change
    add_column :campaign_assessments, :saville_norm_id, :string
  end
end
