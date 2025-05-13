# frozen_string_literal: true

class AddApiKeyFieldsToWebhookSubscriptions < ActiveRecord::Migration[7.1]
  def change
    # rubocop:disable Rails/BulkChangeTable
    add_column :webhook_subscriptions, :encrypted_api_key, :string
    add_column :webhook_subscriptions, :encrypted_api_key_iv, :string
    add_column :webhook_subscriptions, :api_key_header, :string
    # rubocop:enable Rails/BulkChangeTable
  end
end
