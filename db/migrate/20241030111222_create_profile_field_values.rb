# frozen_string_literal: true

class CreateProfileFieldValues < ActiveRecord::Migration[7.1]
  def change
    create_table :profile_field_values do |t|
      t.float :numeric_value
      t.string :string_value
      t.references :user_profile, null: false, foreign_key: { on_delete: :cascade }, index: true
      t.references :profile_field, null: false, foreign_key: { on_delete: :cascade }, index: true

      t.timestamps
    end
  end
end
