# frozen_string_literal: true

class AddHoganGroupNameToHoganCredential < ActiveRecord::Migration[7.1]
  def up
    add_column :hogan_credentials, :hogan_group_name, :string

    execute <<-SQL.squish
      UPDATE hogan_credentials
      SET hogan_group_name = clients.hogan_group_name
      FROM users
      JOIN clients ON users.project_id = clients.id
      WHERE hogan_credentials.user_id = users.id;
    SQL

    execute <<-SQL.squish
      UPDATE hogan_credentials
      SET hogan_group_name = clients.hogan_group_name
      FROM memberships
      JOIN clients ON memberships.client_id = clients.id
      WHERE hogan_credentials.membership_id = memberships.id
      AND hogan_credentials.user_id IS NULL;
    SQL
  end

  def down
    remove_column :hogan_credentials, :hogan_group_name
  end
end
