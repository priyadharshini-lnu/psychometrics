# frozen_string_literal: true

class CreateApplicationPublicKeys < ActiveRecord::Migration[8.0]
  def change
    create_table :application_public_keys do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.bigint :tenant_id, null: false
      t.string :key_id, null: false
      t.text :public_key, null: false
      t.string :fingerprint
      t.string :description
      t.boolean :disabled, null: false, default: false
      t.integer :created_by_id

      t.timestamps
    end

    add_index :application_public_keys, :key_id, unique: true
    add_index :application_public_keys, %i[user_id disabled]
    add_index :application_public_keys, :tenant_id
  end
end
