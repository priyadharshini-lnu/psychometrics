# frozen_string_literal: true

class CreateCampaignIdps < ActiveRecord::Migration[7.1]
  def change
    create_table :campaign_idps do |t|
      t.boolean :automatically_assign_new, default: false
      t.references :campaign, null: false, foreign_key: true
      t.references :idp_template, null: false, foreign_key: true

      t.timestamps
    end

    add_index :campaign_idps, %i[campaign_id idp_template_id], unique: true
  end
end
