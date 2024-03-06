class AddAutoAssignToCampaignAssessmentAndReports < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_assessments, :auto_assign, :boolean, default: true
    add_column :campaign_reports, :auto_assign, :boolean, default: true
  end
end
