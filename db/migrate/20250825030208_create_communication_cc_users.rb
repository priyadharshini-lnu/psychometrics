# frozen_string_literal: true

class CreateCommunicationCcUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :communication_cc_users do |t|
      t.references :communication, null: false, foreign_key: { on_delete: :cascade }
      t.references :user, null: false, foreign_key: { on_delete: :cascade }

      t.timestamps
    end

    add_index :communication_cc_users, %i[communication_id user_id], unique: true
  end
end
