# frozen_string_literal: true

class AddClientIdToDesignSettings < ActiveRecord::Migration[7.1]
  def up
    add_reference :design_settings, :client, foreign_key: { to_table: :clients }, null: true

    execute <<~SQL.squish
      ALTER TABLE design_settings ALTER COLUMN project_id DROP NOT NULL
    SQL

    execute <<~SQL.squish
      UPDATE design_settings
      SET client_id = project_id, project_id = NULL
      WHERE project_id IN (SELECT id FROM clients WHERE ancestry IS NULL)
    SQL
  end

  def down
    execute <<~SQL.squish
      UPDATE design_settings
      SET project_id = client_id
      WHERE client_id IS NOT NULL AND project_id IS NULL
    SQL

    execute <<~SQL.squish
      ALTER TABLE design_settings ALTER COLUMN project_id SET NOT NULL
    SQL

    remove_reference :design_settings, :client, foreign_key: { to_table: :clients }
  end
end
