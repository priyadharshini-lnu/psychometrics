# frozen_string_literal: true

class AddUniqueIndexToCampaignFactorValues < ActiveRecord::Migration[7.1]
  def change
    add_index :campaign_factor_values, %i[campaign_id user_id campaign_factor_id], unique: true
  end
end
