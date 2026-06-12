# frozen_string_literal: true

class CreateClientSsoSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :client_sso_settings do |t|
      t.bigint :tenant_id, null: false
      t.index :tenant_id, unique: true
      t.boolean :sso_enabled, default: false, null: false
      t.boolean :sso_enforced, default: false, null: false
      t.string :idp_entity_id
      t.string :idp_sso_url
      t.string :idp_slo_url
      t.text :idp_cert
      t.integer :session_timeout, default: 120, null: false
      t.jsonb :allowed_domains, default: [], null: false
      t.timestamps
    end

    reversible do |dir|
      dir.up do
        execute <<~SQL.squish
          INSERT INTO client_sso_settings (tenant_id, created_at, updated_at)
          SELECT clients.id, NOW(), NOW()
          FROM clients
          WHERE clients.ancestry_depth = 0
        SQL
      end
    end
  end
end
