# frozen_string_literal: true

class CreateOracleCredentials < ActiveRecord::Migration[7.1]
  def change
    create_table :oracle_credentials do |t|
      t.string :idcs_user_id, null: false
      t.string :idcs_user_name, null: false

      t.references :user, foreign_key: { on_delete: :cascade }, index: { unique: true }

      t.timestamps
    end
  end
end
