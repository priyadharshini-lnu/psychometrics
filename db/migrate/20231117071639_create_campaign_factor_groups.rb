class CreateCampaignFactorGroups < ActiveRecord::Migration[7.1]
  def change
    create_table :campaign_factor_groups do |t|
      t.string :name, null: false
      t.references :campaign, foreign_key: { on_delete: :cascade }, null: false
      t.integer :position

      t.timestamps
    end
  end
end
