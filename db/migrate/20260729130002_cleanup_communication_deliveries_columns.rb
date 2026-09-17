# frozen_string_literal: true

class CleanupCommunicationDeliveriesColumns < ActiveRecord::Migration[7.1]
  def change
    change_table :communication_deliveries, bulk: true do |t|
      t.remove :level_snapshot, type: :jsonb
      t.remove :recipient_snapshot, type: :jsonb
      t.remove :idempotency_key, type: :string
      t.remove :started_at, type: :datetime
      t.remove :delivery_interval, type: :string

      t.datetime :paused_at
    end
  end
end
