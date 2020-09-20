# frozen_string_literal: true

class CreateMindmillCredential < ActiveRecord::Migration[5.1]
  def change
    create_table :mindmill_credentials do |t|
      t.references :users_result, foreign_key: { on_delete: :cascade }
      t.string :user_name
      t.string :encrypted_password
      t.string :encrypted_password_iv
    end
  end
end
