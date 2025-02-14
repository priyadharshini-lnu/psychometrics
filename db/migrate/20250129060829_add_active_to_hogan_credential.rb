# frozen_string_literal: true

class AddActiveToHoganCredential < ActiveRecord::Migration[7.1]
  def change
    add_column :hogan_credentials, :active, :boolean, default: true
  end
end
