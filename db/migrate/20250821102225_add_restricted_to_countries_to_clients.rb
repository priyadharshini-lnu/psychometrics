# frozen_string_literal: true

class AddRestrictedToCountriesToClients < ActiveRecord::Migration[7.1]
  def change
    add_column :clients, :restricted_to_countries, :text, array: true, default: []
  end
end
