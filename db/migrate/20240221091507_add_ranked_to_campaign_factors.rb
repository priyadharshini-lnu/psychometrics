class AddRankedToCampaignFactors < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_factors, :ranked, :boolean, default: false, null: false
  end
end
