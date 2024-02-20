class AddFinalizeScoreFieldsToCampaignUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_users, :campaign_scores_calculated_date, :datetime
    add_column :campaign_users, :campaign_scores_finalized_date, :datetime
  end
end
