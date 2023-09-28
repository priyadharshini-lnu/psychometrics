class AddScaleToFactors < ActiveRecord::Migration[6.1]
  def change
    add_column :factors, :scale_min, :float, default: nil
    add_column :factors, :scale_max, :float, default: nil
  end
end
