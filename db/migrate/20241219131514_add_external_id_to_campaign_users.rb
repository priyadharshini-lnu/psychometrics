# frozen_string_literal: true

class AddExternalIdToCampaignUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_users, :external_id, :string, default: nil

    add_index :campaign_users, %i[campaign_id external_id], unique: true
  end
end
