# frozen_string_literal: true

class CreateApplicationIpWhitelistEntries < ActiveRecord::Migration[8.0]
  def change
    create_table :application_ip_whitelist_entries do |t|
      t.references :application_setting, null: false, foreign_key: { on_delete: :cascade }
      t.bigint :tenant_id, null: false
      t.inet :ip_or_cidr, null: false
      t.text :description
      t.boolean :enabled, null: false, default: true

      t.timestamps
    end

    add_index :application_ip_whitelist_entries, %i[application_setting_id enabled]
    add_index :application_ip_whitelist_entries, :tenant_id
    add_index :application_ip_whitelist_entries, :ip_or_cidr
  end
end
