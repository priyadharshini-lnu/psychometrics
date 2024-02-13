class AddCampaignUsersUniqueIndex < ActiveRecord::Migration[7.0]
  def change
    add_index :campaign_users, %i[campaign_id user_id], unique: true
  end
end
