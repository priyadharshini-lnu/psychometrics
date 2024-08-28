# frozen_string_literal: true

class AddShowWatermarkToCampaignOptions < ActiveRecord::Migration[7.1]
  def change
    change_table :campaign_options, bulk: true do |t|
      t.boolean :show_watermark, default: false
      t.string :watermark_content, default: ''
    end
  end
end
