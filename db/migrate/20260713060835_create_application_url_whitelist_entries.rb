# frozen_string_literal: true

class CreateApplicationUrlWhitelistEntries < ActiveRecord::Migration[8.0]
  def change
    create_table :application_url_whitelist_entries do |t|
      t.references :application_setting, null: false, foreign_key: { on_delete: :cascade }
      t.bigint :tenant_id, null: false
      t.string :url, null: false
      t.text :description
      t.boolean :enabled, null: false, default: true

      t.timestamps
    end

    add_index :application_url_whitelist_entries, %i[application_setting_id enabled]
    add_index :application_url_whitelist_entries, :tenant_id
    add_index :application_url_whitelist_entries, :url
  end
end
