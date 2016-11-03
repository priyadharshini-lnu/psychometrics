class AddMembershipIdToNotifications < ActiveRecord::Migration[5.0]
  def change
    add_reference :notifications, :membership
    remove_column :notifications, :client_id, :integer
    remove_column :notifications, :user_id, :integer
  end
end
