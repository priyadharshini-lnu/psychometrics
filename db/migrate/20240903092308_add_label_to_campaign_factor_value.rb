# frozen_string_literal: true

class AddLabelToCampaignFactorValue < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_factor_values, :label, :string
  end
end
