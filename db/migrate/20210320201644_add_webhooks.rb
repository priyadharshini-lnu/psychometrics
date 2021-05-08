# frozen_string_literal: true

class AddWebhooks < ActiveRecord::Migration[5.2]
  def change
    create_table :webhook_subscriptions do |t|
      t.string :url, null: false
      t.boolean :active, null: false, index: true
      t.boolean :encrypted, null: false, default: false
      t.text :secret
    end

    add_reference :webhook_subscriptions, :project, foreign_key: { on_delete: :cascade, to_table: :clients }

    create_table :webhook_subscription_topics do |t|
      t.string :name, null: false, index: true
      t.belongs_to :subscription, null: false, index: true
    end

    create_table :webhook_event_logs do |t|
      t.belongs_to :subscription, null: false, index: true

      t.string :event_name, null: false, index: true
      t.string :event_id, null: false, index: true
      t.integer :status, null: false, index: true

      t.text :request, limit: 64_000, null: false
      t.text :response, limit: 64_000, null: false

      t.datetime :created_at, null: false, index: true
    end
  end
end
