# frozen_string_literal: true

class RemoveAccountManagerFromClient < ActiveRecord::Migration[5.2]
  def change
    remove_column :clients, :account_manager_id
  end
end
