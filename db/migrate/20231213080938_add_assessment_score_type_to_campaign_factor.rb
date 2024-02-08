class AddAssessmentScoreTypeToCampaignFactor < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_factors, :assessment_score_type, :integer, default: 0
  end
end
