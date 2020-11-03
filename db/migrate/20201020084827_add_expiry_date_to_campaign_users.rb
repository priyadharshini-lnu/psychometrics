# frozen_string_literal: true

class AddExpiryDateToCampaignUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :campaign_users, :expiry_date, :datetime
  end
end
