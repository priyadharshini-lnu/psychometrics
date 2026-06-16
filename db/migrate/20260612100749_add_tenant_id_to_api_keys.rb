# frozen_string_literal: true

class AddTenantIdToApiKeys < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def up
    # Clean up invalid API keys
    # Keep ONLY API keys for Users::Application (all other roles should not have API keys)
    execute <<-SQL.squish
      DELETE FROM api_keys
      WHERE id IN (
        SELECT DISTINCT api_keys.id
        FROM api_keys
        INNER JOIN users ON users.id = api_keys.user_id
        WHERE users.role != 'Users::Application'
      )
    SQL

    # Idempotent column addition
    add_column :api_keys, :tenant_id, :bigint unless column_exists?(:api_keys, :tenant_id)

    # Backfill tenant_id from users table
    execute <<-SQL.squish
      UPDATE api_keys
      SET tenant_id = users.tenant_id
      FROM users
      WHERE api_keys.user_id = users.id
      AND api_keys.tenant_id IS NULL
    SQL

    # Add NOT NULL constraint
    # Safe to run directly since we cleaned up all invalid API keys above
    change_column_null :api_keys, :tenant_id, false

    # Add index (idempotent check)
    unless index_exists?(:api_keys, :tenant_id)
      add_index :api_keys, :tenant_id, algorithm: :concurrently
    end
  end

  def down
    remove_index :api_keys, :tenant_id if index_exists?(:api_keys, :tenant_id)
    remove_column :api_keys, :tenant_id
  end
end
