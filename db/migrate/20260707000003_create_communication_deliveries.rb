# frozen_string_literal: true

class CreateCommunicationDeliveries < ActiveRecord::Migration[7.1]
  def change
    # rubocop:disable Metrics/BlockLength
    create_table :communication_deliveries do |t|
      t.references :communication_template, null: false, foreign_key: true

      t.integer :trigger_type, null: false
      t.integer :status, null: false, default: 0
      t.integer :delivery_rule

      t.datetime :delivery_at
      t.string   :delivery_interval
      t.integer  :delivery_interval_number
      t.string   :delivery_interval_period
      t.date     :delivery_start_date
      t.date     :delivery_end_date
      t.time     :delivery_time_of_day
      t.string   :delivery_timezone
      t.string   :delivery_frequency
      t.string   :delivery_weekdays, array: true, default: []
      t.integer  :delivery_delay_hours
      t.string   :assessment_completion_status_code

      t.jsonb    :level_snapshot
      t.jsonb    :recipient_snapshot
      t.string   :idempotency_key

      t.datetime :started_at
      t.datetime :completed_at
      t.datetime :cancelled_at

      t.references :created_by, null: false, foreign_key: { to_table: :users }
      t.references :updated_by, null: false, foreign_key: { to_table: :users }

      t.bigint :tenant_id
      t.timestamps
    end
    # rubocop:enable Metrics/BlockLength

    add_index :communication_deliveries, :tenant_id
    add_index :communication_deliveries, :status
    add_index :communication_deliveries, :trigger_type
    add_index :communication_deliveries, :idempotency_key, unique: true
  end
end
