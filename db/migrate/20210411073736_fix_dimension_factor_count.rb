# frozen_string_literal: true

class FixDimensionFactorCount < ActiveRecord::Migration[5.2]
  def change
    Dimension.find_each do |dimension|
      dimension.update(factors_count: dimension.all_factors.count)
    end
  end
end
