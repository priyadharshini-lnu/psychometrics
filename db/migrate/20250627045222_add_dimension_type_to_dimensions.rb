# frozen_string_literal: true

class AddDimensionTypeToDimensions < ActiveRecord::Migration[7.1]
  def change
    add_column :dimensions, :dimension_type, :integer, default: 0
  end
end
