# frozen_string_literal: true

class CreateCommunicationDeliveryCcUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :communication_delivery_cc_users do |t|
      t.references :communication_delivery, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.bigint :tenant_id
      t.timestamps
    end
    add_index :communication_delivery_cc_users, :tenant_id
    add_index :communication_delivery_cc_users, %i[communication_delivery_id user_id], unique: true
  end
end
