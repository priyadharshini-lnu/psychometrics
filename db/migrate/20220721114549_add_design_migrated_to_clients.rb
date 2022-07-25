# frozen_string_literal: true

class AddDesignMigratedToClients < ActiveRecord::Migration[5.2]
  def change
    add_column :clients, :design_migrated, :boolean, default: false
  end
end
