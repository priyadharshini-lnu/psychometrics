# frozen_string_literal: true

class AddApiKeyFieldsToWebhookSubscriptions < ActiveRecord::Migration[7.1]
  def change
    add_column :webhook_subscriptions, :encrypted_api_key, :string
    add_column :webhook_subscriptions, :encrypted_api_key_iv, :string
    add_column :webhook_subscriptions, :api_key_header, :string
  end
end
