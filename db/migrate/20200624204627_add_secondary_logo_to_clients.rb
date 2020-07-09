# frozen_string_literal: true

class AddSecondaryLogoToClients < ActiveRecord::Migration[5.1]
  def change
    add_column :clients, :secondary_logo, :string
  end
end
