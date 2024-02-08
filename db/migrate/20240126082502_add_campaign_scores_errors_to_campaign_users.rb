class AddCampaignScoresErrorsToCampaignUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_users, :campaign_scores_errors, :json
  end
end
