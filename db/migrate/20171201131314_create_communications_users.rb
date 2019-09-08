# frozen_string_literal: true

class CreateCommunicationsUsers < ActiveRecord::Migration[5.0]
  def change
    create_table :communications_users do |t|
      t.references :user, foreign_key: { on_delete: :cascade }
      t.references :communication, foreign_key: { on_delete: :cascade }

      t.timestamps
    end
  end
end
