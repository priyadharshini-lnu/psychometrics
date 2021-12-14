# frozen_string_literal: true

class AddWebhookAuthentication < ActiveRecord::Migration[5.2]
  def up
    change_table :webhook_subscriptions do |t|
      t.boolean :auth_enabled, default: false
      t.string :username
      t.string :encrypted_password
      t.string :encrypted_password_iv
    end
  end

  def down
    change_table :webhook_subscriptions do |t|
      t.remove :auth_enabled
      t.remove :username
      t.remove :encrypted_password
      t.remove :encrypted_password_iv
    end
  end
end
