# frozen_string_literal: true

class CreateEventDelivery < ActiveRecord::Migration[7.1]
  def change
    create_table :event_deliveries do |t|
      t.belongs_to :resource, polymorphic: true, null: false
      t.integer :event_type, null: false
      t.integer :delivery_type, null: false
      t.datetime :sent_at
      t.jsonb :meta

      t.timestamps
    end
  end
end
