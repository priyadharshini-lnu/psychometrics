class AddCampaignIdToUserIdPlans < ActiveRecord::Migration[7.1]
  def change
    add_reference :user_idp_plans, :campaign
    change_column_null :user_idp_plans, :campaign_id, false

    add_reference :users, :manager
  end
end
