# frozen_string_literal: true

class CreateCampaignOptions < ActiveRecord::Migration[5.1]
  def change
    create_table :campaign_options do |t|
      t.references :campaign, foreign_key: true
      t.string :time_zone
      t.boolean :fixed_time, default: false
      t.integer :fixed_time_duration
      t.boolean :instructions_enabled, default: false
      t.text :instructions

      t.timestamps
    end
  end
end
