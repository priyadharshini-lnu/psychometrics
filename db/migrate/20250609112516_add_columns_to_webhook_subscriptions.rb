# frozen_string_literal: true

class AddColumnsToWebhookSubscriptions < ActiveRecord::Migration[7.1]
  def change
    change_table :webhook_subscriptions, bulk: true do |t|
      t.integer :rate_limit, default: 60, null: false
      t.integer :rate_limit_period, default: 1, null: false
    end
  end
end
