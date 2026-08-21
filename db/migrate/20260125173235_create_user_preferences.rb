# frozen_string_literal: true

class CreateUserPreferences < ActiveRecord::Migration[8.0]
  def change
    create_table :user_preferences do |t|
      t.references :user, null: false, foreign_key: true
      t.string :category, null: false
      t.string :config_key, null: false
      t.string :name
      t.text :description
      t.jsonb :payload, null: false, default: {}
      t.string :resource_type
      t.bigint :resource_id
      t.bigint :tenant_id

      t.timestamps
    end

    add_foreign_key :user_preferences, :clients, column: :tenant_id

    # NULLs are distinct in a btree, so resource-less rows need their own partial unique index.
    add_index :user_preferences,
              %i[user_id category config_key],
              unique: true,
              where: 'resource_id IS NULL',
              name: 'idx_user_prefs_unique_global'
    add_index :user_preferences,
              %i[user_id category config_key resource_type resource_id],
              unique: true,
              where: 'resource_id IS NOT NULL',
              name: 'idx_user_prefs_unique_scoped'

    add_index :user_preferences, %i[resource_type resource_id]
    add_index :user_preferences, :category
    add_index :user_preferences, :tenant_id
  end
end
