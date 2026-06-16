# frozen_string_literal: true

class AddTenantIdToApiKeys < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def up
    add_column :api_keys, :tenant_id, :bigint

    execute <<-SQL.squish
      UPDATE api_keys
      SET tenant_id = users.tenant_id
      FROM users
      WHERE api_keys.user_id = users.id
    SQL

    change_column_null :api_keys, :tenant_id, false

    add_index :api_keys, :tenant_id, algorithm: :concurrently
  end

  def down
    remove_index :api_keys, :tenant_id if index_exists?(:api_keys, :tenant_id)
    remove_column :api_keys, :tenant_id
  end
end
