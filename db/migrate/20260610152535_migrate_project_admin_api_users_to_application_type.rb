# frozen_string_literal: true

class MigrateProjectAdminApiUsersToApplicationType < ActiveRecord::Migration[8.0]
  def up
    execute <<~SQL.squish
      UPDATE users
      SET role = 'Users::Application',
          encrypted_password = '',
          tenant_id = (
            SELECT MIN(m.tenant_id)
            FROM memberships m
            WHERE m.user_id = users.id
              AND m.role = 2
          )
      WHERE users.role = 'Users::Admin'
        AND users.id IN (
          SELECT DISTINCT users.id
          FROM users
          INNER JOIN memberships ON memberships.user_id = users.id
          INNER JOIN api_keys ON api_keys.user_id = users.id
          WHERE memberships.role = 2
        )
    SQL
  end
end
