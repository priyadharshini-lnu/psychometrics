# frozen_string_literal: true

class AddUniqueIndexForCampaignAssessment < ActiveRecord::Migration[5.2]
  def change
    add_index :campaign_assessments, %i[campaign_id assessment_id], unique: true
  end
end
