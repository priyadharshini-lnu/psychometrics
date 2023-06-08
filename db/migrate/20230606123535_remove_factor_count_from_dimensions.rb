# frozen_string_literal: true

class RemoveFactorCountFromDimensions < ActiveRecord::Migration[6.1]
  def change
    remove_column :dimensions, :factors_count
  end
end
