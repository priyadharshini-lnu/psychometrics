class AddRequireSchedulingToCampaignAssessment < ActiveRecord::Migration[7.0]
  def change
    add_column :campaign_assessments, :require_scheduling, :boolean, default: false
  end
end
