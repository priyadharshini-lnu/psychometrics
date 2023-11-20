class AddCampaignFactorsToReports < ActiveRecord::Migration[7.1]
  def change
    add_column :reports, :campaign_factors, :jsonb, null: false, default: []
  end
end
