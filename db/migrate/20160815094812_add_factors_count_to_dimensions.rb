class AddFactorsCountToDimensions < ActiveRecord::Migration[5.0]
  def change
    add_column :dimensions, :factors_count, :integer, default: 0
  end
end
