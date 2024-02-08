# frozen_string_literal: true

class CreateCampaignFactorValues < ActiveRecord::Migration[7.1]
  def change
    create_table :campaign_factor_values do |t|
      t.references :campaign, foreign_key: { on_delete: :cascade }, null: false
      t.references :user, foreign_key: { on_delete: :cascade }, null: false
      t.references :campaign_factor, foreign_key: { on_delete: :cascade }, null: false
      t.string :string_value
      t.float :numeric_value

      t.timestamps
    end
  end
end
