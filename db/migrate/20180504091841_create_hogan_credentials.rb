# frozen_string_literal: true

class CreateHoganCredentials < ActiveRecord::Migration[5.1]
  def change
    create_table :hogan_credentials do |t|
      t.references :membership, null: false, foreign_key: { on_delete: :cascade }
      t.string :encrypted_password, null: false
      t.string :encrypted_password_iv, null: false
      t.string :participant_id, null: false

      t.timestamps
    end
  end
end
