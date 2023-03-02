class AddMissingIndexes < ActiveRecord::Migration[6.1]
  def change
    add_index :media_responses, :users_result_id
    
    add_index :memberships, :user_id
    add_index :memberships, :campaign_id
    add_index :memberships, :role

    add_index :threesixty_email_schedules, :name
    add_index :threesixty_email_schedules, :delivered_at
    add_index :threesixty_email_schedules, :scheduled_date
  end
end
