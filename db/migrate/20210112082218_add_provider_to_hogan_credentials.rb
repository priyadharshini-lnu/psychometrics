# frozen_string_literal: true

class AddProviderToHoganCredentials < ActiveRecord::Migration[5.2]
  def change
    add_column :hogan_credentials, :provider, :integer, default: 0
  end
end
