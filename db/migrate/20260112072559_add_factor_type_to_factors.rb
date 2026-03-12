# frozen_string_literal: true

class AddFactorTypeToFactors < ActiveRecord::Migration[8.0]
  def change
    add_column :factors, :factor_type, :integer, default: 0, null: false
    add_index :factors, :factor_type
  end
end
