class AddAllowMultipleResponseToCampaignAssessments < ActiveRecord::Migration[6.1]
  def change
    add_column :campaign_assessments, :allow_multiple_responses, :boolean, default: false
  end
end
