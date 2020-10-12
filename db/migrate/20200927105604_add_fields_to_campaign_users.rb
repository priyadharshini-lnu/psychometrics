# frozen_string_literal: true

class AddFieldsToCampaignUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :campaign_users, :started_at, :datetime
    add_column :campaign_users, :completed_at, :datetime
    add_column :campaign_users, :completed_via, :integer
    add_column :campaign_users, :completion_status, :integer, default: 0

    add_index :campaign_users, :started_at
    add_index :campaign_users, :completed_at
    add_index :campaign_users, :completed_via
    add_index :campaign_users, :completion_status
  end
end
