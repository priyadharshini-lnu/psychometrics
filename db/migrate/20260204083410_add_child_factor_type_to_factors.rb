# frozen_string_literal: true

class AddChildFactorTypeToFactors < ActiveRecord::Migration[8.0]
  def change
    add_column :factors, :child_factor_type, :integer
  end
end
