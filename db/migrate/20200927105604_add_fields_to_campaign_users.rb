# frozen_string_literal: true

class AddFieldsToCampaignUsers < ActiveRecord::Migration[5.1]
  def change
    execute <<-SQL
      CREATE TYPE completed_via AS ENUM ('user', 'timed_out');
    SQL
    execute <<-SQL
      CREATE TYPE completion_status AS ENUM ('new', 'in_progress', 'completed');
    SQL

    add_column :campaign_users, :started_at, :datetime
    add_column :campaign_users, :completed_at, :datetime
    add_column :campaign_users, :completed_via, :completed_via
    add_column :campaign_users, :completion_status, :completion_status

    add_index :campaign_users, :completed_via
    add_index :campaign_users, :completion_status
  end
end
