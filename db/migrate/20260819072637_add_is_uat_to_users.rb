# frozen_string_literal: true

class AddIsUatToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :is_uat, :boolean, default: false, null: false
  end
end
