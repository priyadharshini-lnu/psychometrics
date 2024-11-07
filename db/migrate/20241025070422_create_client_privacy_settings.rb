# frozen_string_literal: true

class CreateClientPrivacySettings < ActiveRecord::Migration[7.1]
  def change
    create_table :client_privacy_settings do |t|
      t.references :client, foreign_key: { on_delete: :cascade }, null: false
      t.boolean :disable_data_processing, default: false
      t.timestamps
    end

    reversible do |dir|
      dir.up do
        sql = <<~SQL.squish
          INSERT INTO client_privacy_settings (client_id, disable_data_processing, created_at, updated_at)
          SELECT clients.id, false, NOW(), NOW()
          FROM clients
          WHERE clients.ancestry_depth = 0
        SQL

        execute(sql)
      end
    end
  end
end
