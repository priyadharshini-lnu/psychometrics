# frozen_string_literal: true

class AddOauthFieldsToWebhookSubscriptions < ActiveRecord::Migration[8.0]
  def change
    change_table :webhook_subscriptions, bulk: true do |t|
      t.string :oauth_grant_type
      t.string :oauth_token_url
      t.string :encrypted_oauth_client_id
      t.string :encrypted_oauth_client_id_iv
      t.string :encrypted_oauth_client_secret
      t.string :encrypted_oauth_client_secret_iv
      t.string :oauth_scope
    end
  end
end
