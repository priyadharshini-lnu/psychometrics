# frozen_string_literal: true

class AddMigratedToClients < ActiveRecord::Migration[5.1]
  def change
    add_column :clients, :migrated, :boolean, default: false
  end
end
