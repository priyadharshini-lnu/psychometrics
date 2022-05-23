# frozen_string_literal: true

class CreateOldPasswords < ActiveRecord::Migration[5.2]
  def change
    create_table :old_passwords do |t|
      t.string :encrypted_password
      t.string :password_archivable_type
      t.integer :password_archivable_id
      t.string :password_salt
      t.datetime :created_at

      t.timestamps
    end
    add_index :old_passwords, %i[password_archivable_type password_archivable_id], name: 'index_password_archivable'
  end
end
