# frozen_string_literal: true

class RemoveStrongPasswordEnabledFromClients < ActiveRecord::Migration[5.2]
  def change
    remove_column :clients, :strong_password_enabled, :boolean
  end
end
