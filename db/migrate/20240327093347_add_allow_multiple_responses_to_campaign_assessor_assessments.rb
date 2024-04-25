class AddAllowMultipleResponsesToCampaignAssessorAssessments < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_assessor_assessments, :allow_multiple_responses, :boolean, default: false
  end
end
