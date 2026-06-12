# frozen_string_literal: true

class CreateSessions < ActiveRecord::Migration[8.0]
  def change
    create_table :sessions do |t|
      t.string :session_id, null: false
      t.text :data
      t.references :user, index: true
      t.string :subdomain
      t.bigint :tenant_id
      t.timestamps
    end

    add_index :sessions, :session_id, unique: true
    add_index :sessions, :updated_at
    add_index :sessions, %i[user_id subdomain]
  end
end
