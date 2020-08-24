# frozen_string_literal: true

class AddActiveToCampaignsUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :campaign_users, :active, :boolean, default: true
  end
end
