# frozen_string_literal: true

class AddDisableWebhooksToCampaignOptions < ActiveRecord::Migration[8.0]
  def change
    add_column :campaign_options, :disable_webhooks, :boolean, default: false, null: false
  end
end
