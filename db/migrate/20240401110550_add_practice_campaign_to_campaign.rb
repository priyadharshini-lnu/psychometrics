class AddPracticeCampaignToCampaign < ActiveRecord::Migration[7.1]
  def change
    add_column :campaigns, :practice_campaign, :boolean, default: false
  end
end
