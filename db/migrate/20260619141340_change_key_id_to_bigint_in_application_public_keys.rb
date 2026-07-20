# frozen_string_literal: true

class ChangeKeyIdToBigintInApplicationPublicKeys < ActiveRecord::Migration[8.0]
  def up
    execute('DELETE FROM application_public_keys')

    remove_index :application_public_keys, :key_id if index_exists?(:application_public_keys, :key_id)

    change_table :application_public_keys, bulk: true do |t|
      t.remove :key_id
      t.bigint :key_id
    end

    change_column_null :application_public_keys, :key_id, false
    add_index :application_public_keys, :key_id, unique: true
  end

  def down
    execute('DELETE FROM application_public_keys')

    remove_index :application_public_keys, :key_id if index_exists?(:application_public_keys, :key_id)

    change_table :application_public_keys, bulk: true do |t|
      t.remove :key_id
      t.string :key_id
    end

    change_column_null :application_public_keys, :key_id, false
    add_index :application_public_keys, :key_id
  end
end
