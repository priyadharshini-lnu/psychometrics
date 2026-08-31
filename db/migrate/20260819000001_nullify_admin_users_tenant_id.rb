# frozen_string_literal: true

class NullifyAdminUsersTenantId < ActiveRecord::Migration[7.0]
  def up
    execute "UPDATE users SET tenant_id = NULL WHERE role = 'Users::Admin'"
  end

  def down
    # No-op
  end
end
