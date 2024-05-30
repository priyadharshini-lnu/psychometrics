class AddOwnerIdToCampaignTemplates < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_templates, :owner_id, :integer
  end
end
