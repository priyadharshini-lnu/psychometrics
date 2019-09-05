class AddWeightToInnovationStylesFactors < ActiveRecord::Migration[5.1]
  def change
    add_column :innovation_styles_factors, :weight, :float, precision: 2, default: 1.0
  end
end
