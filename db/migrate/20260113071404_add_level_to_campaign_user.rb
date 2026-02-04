# frozen_string_literal: true

class AddLevelToCampaignUser < ActiveRecord::Migration[8.0]
  def change
    add_column :campaign_users, :level, :integer, null: true
  end
end
