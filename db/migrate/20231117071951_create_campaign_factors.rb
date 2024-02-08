class CreateCampaignFactors < ActiveRecord::Migration[7.1]
  def change
    create_table :campaign_factors do |t|
      t.references :campaign_factor_group, foreign_key: true
      t.integer :position
      t.string :name, null: false
      t.string :code, null: false
      t.text :description
      t.integer :factor_type, default: 0, null: false
      t.integer :output_type, default: 0, null: false
      t.references :campaign, foreign_key: { on_delete: :cascade }, null: false
      t.references :factor, foreign_key: { on_delete: :restrict }
      t.references :assessment, foreign_key: { on_delete: :restrict }
      t.string :sheet_column_name
      t.boolean :public_visibility, default: true, null: false

      t.timestamps
    end

    add_index :campaign_factors, [:campaign_id, :code], unique: true
  end
end
