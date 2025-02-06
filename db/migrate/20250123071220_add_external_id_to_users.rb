# frozen_string_literal: true

class AddExternalIdToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :external_id, :string
    add_index :users, :external_id, unique: true
  end
end
