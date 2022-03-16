# frozen_string_literal: true

class AddEnable2FaToUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :enable_2fa, :boolean, default: true, null: false
  end
end
