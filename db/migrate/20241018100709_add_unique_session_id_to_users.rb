# frozen_string_literal: true

class AddUniqueSessionIdToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :unique_session_id, :string
  end
end
