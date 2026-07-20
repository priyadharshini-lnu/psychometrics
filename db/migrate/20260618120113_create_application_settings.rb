# frozen_string_literal: true

class CreateApplicationSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :application_settings do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, index: { unique: true }
      t.bigint :tenant_id, null: false
      t.boolean :ip_whitelisting_enabled, null: false, default: false
      t.timestamps
    end
    add_index :application_settings, :tenant_id

    prefill_existing_data
  end

  def prefill_existing_data
    ActiveRecord::Base.connection.execute <<-SQL.squish
      INSERT INTO application_settings (user_id, tenant_id, ip_whitelisting_enabled, created_at, updated_at)
      SELECT users.id, users.tenant_id, FALSE, NOW(), NOW()
      FROM users
      LEFT JOIN application_settings ON application_settings.user_id = users.id
      WHERE users.role = 'Users::Application'
        AND users.tenant_id IS NOT NULL
        AND application_settings.id IS NULL
    SQL
  end
end
