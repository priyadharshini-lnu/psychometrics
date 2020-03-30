# frozen_string_literal: true

class AddFieldsToFactorsSubFactors < ActiveRecord::Migration[5.1]
  def change
    add_column :factors_sub_factors, :predicate, :string
    add_column :factors_sub_factors, :value, :float
    add_column :factors_sub_factors, :position, :integer
  end
end
