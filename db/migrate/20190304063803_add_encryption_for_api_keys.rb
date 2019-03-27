class AddEncryptionForApiKeys < ActiveRecord::Migration[5.1]
  def change
    add_column :api_keys, :key, :string
    rename_column :api_keys, :token, :encrypted_token
    add_column :api_keys, :encrypted_token_iv, :string

    add_index :api_keys, :encrypted_token_iv, unique: true
    add_index :api_keys, :key, unique: true
  end
end
