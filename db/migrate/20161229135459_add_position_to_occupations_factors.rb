class AddPositionToOccupationsFactors < ActiveRecord::Migration[5.0]
  def change
    add_column :occupations_factors, :position, :int, default: nil
  end
end
