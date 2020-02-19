# frozen_string_literal: true

class AddStrongPasswordEnabledToClient < ActiveRecord::Migration[5.1]
  def change
    add_column :clients, :strong_password_enabled, :boolean, default: false
  end
end
