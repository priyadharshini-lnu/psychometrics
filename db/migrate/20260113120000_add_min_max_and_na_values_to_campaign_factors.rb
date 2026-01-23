# frozen_string_literal: true

class AddMinMaxAndNaValuesToCampaignFactors < ActiveRecord::Migration[7.1]
  def change
    change_table :campaign_factors, bulk: true do |t|
      t.integer :min_value
      t.integer :max_value
      t.boolean :is_na_allowed, default: false, null: false
    end
  end
end
