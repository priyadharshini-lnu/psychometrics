class AddAdditionalTimeToCampaignUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :campaign_users, :additional_time, :integer
  end
end
