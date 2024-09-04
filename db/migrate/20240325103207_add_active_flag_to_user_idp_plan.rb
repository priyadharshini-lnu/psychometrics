class AddActiveFlagToUserIdpPlan < ActiveRecord::Migration[7.1]
  def change
    add_column :user_idp_plans, :active, :boolean, default: true
    add_index :user_idp_plans, %i[user_id active], unique: true, where: 'active'
  end
end
