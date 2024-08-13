class AddShowWatermarkToCampaignOptions < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_options, :show_watermark, :boolean, default: false
    add_column :campaign_options, :watermark_content, :string, default: ''
  end
end
