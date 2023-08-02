class AddActivityDurationToCampaignAssessment < ActiveRecord::Migration[7.0]
  def change
    add_column :campaign_assessments, :workshop_activity_duration, :integer, null: true
  end
end
