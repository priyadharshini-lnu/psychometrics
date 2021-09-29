# frozen_string_literal: true

class CreateSmsRecords < ActiveRecord::Migration[5.2]
  def change
    create_table :sms_records do |t|
      t.string :message
      t.datetime :link_expiry
      t.jsonb :filters, default: {}
      t.belongs_to :creator, foreign_key: { name: :creator_id, to_table: :users, on_delete: :cascade }, null: false
      t.belongs_to :campaign, foreign_key: { on_delete: :cascade }, null: false

      t.timestamps
    end
  end
end
