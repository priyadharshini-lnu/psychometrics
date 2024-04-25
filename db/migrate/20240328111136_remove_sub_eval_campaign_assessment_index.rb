class RemoveSubEvalCampaignAssessmentIndex < ActiveRecord::Migration[7.1]
  def change
    remove_index :users_campaigns_assessments, name: :sub_eval_campaign_assessment
  end
end
