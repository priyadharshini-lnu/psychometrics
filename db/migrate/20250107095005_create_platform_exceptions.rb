# frozen_string_literal: true

class CreatePlatformExceptions < ActiveRecord::Migration[7.1]
  def change
    create_table :platform_exceptions do |t|
      t.string :identifier, null: false, index: { unique: true }
      t.integer :consecutive_failure_count, default: 0, null: false
      t.belongs_to :resource, polymorphic: true
      t.datetime :last_notified_at
      t.jsonb :meta
      t.timestamps
    end
  end
end
