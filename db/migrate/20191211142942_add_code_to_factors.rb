# frozen_string_literal: true

class AddCodeToFactors < ActiveRecord::Migration[5.1]
  def change
    add_column :factors, :code, :string, null: true
  end
end
