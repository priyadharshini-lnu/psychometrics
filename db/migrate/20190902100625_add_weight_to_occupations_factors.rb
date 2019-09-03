class AddWeightToOccupationsFactors < ActiveRecord::Migration[5.1]
  def change
    add_column :occupations_factors, :weight, :float, precision: 2, default: 1.0
  end
end
