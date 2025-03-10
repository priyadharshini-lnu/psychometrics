# frozen_string_literal: true

class CreateUserSavedFilters < ActiveRecord::Migration[7.1]
  def change
    create_table :user_saved_filters do |t|
      t.string :name, null: false
      t.references :user, null: false, foreign_key: true, index: true
      t.string :resource_type, null: false
      t.jsonb :filter_params, null: false, default: {}
      t.boolean :favorite, default: false
      t.timestamps

      t.index %i[user_id resource_type]
      t.index :filter_params, using: :gin
    end

    add_index :user_saved_filters, %i[name user_id resource_type], unique: true
  end
end
