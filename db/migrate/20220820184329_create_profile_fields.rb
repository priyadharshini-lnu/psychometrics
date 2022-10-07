# frozen_string_literal: true

class CreateProfileFields < ActiveRecord::Migration[6.1]
  def change
    create_table :profile_fields do |t|
      t.boolean :required
      t.boolean :half_size
      t.integer :position

      t.timestamps
    end

    add_reference :profile_fields, :question, foreign_key: { on_delete: :cascade }, null: false
    add_reference :profile_fields, :profile_setting, foreign_key: { on_delete: :cascade }, null: false
  end
end
