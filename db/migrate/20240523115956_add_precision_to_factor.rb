class AddPrecisionToFactor < ActiveRecord::Migration[7.1]
  def change
    add_column :factors, :precision, :integer, default: nil
  end
end
