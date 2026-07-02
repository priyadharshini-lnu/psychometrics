# frozen_string_literal: true

class BackfillDesignSettingsForRootClients < ActiveRecord::Migration[7.1]
  def up
    execute <<~SQL.squish
      INSERT INTO design_settings (client_id, tenant_id, logo_alt_text, secondary_logo_alt_text, created_at, updated_at)
      SELECT c.id, c.id, c.name, c.name, NOW(), NOW()
      FROM clients c
      WHERE c.ancestry IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM design_settings ds WHERE ds.client_id = c.id
        )
    SQL
  end

  def down
    execute <<~SQL.squish
      DELETE FROM design_settings WHERE client_id IS NOT NULL AND project_id IS NULL
    SQL
  end
end
