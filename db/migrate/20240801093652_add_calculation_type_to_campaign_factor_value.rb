# frozen_string_literal: true

class AddCalculationTypeToCampaignFactorValue < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_factor_values, :calculation_type, :integer, default: 0
  end
end
