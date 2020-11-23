# frozen_string_literal: true

class AddAvailableLanguagesToClients < ActiveRecord::Migration[5.1]
  def change
    add_column :clients, :locales, :json, default: []
  end
end
