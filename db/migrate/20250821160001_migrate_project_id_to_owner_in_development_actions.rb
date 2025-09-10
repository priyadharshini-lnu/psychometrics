# frozen_string_literal: true

class MigrateProjectIdToOwnerInDevelopmentActions < ActiveRecord::Migration[7.1]
  def up
    # Migrate existing project_id to owner (Project)
    execute <<-SQL.squish
      UPDATE development_actions
      SET owner_type = 'Client', owner_id = project_id
      WHERE project_id IS NOT NULL
    SQL

    # Set source_type for existing records (assuming they are platform-based)
    execute <<-SQL.squish
      UPDATE development_actions
      SET source_type = 0
      WHERE source_type IS NULL
    SQL
  end

  def down
    # Revert owner back to project_id
    execute <<-SQL.squish
      UPDATE development_actions
      SET project_id = owner_id
      WHERE owner_type = 'Client' AND owner_id IS NOT NULL
    SQL

    # Clear owner fields
    execute <<-SQL.squish
      UPDATE development_actions
      SET owner_type = NULL, owner_id = NULL
    SQL
  end
end
