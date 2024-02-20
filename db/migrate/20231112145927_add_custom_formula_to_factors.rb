class AddCustomFormulaToFactors < ActiveRecord::Migration[7.0]
  def change
    add_column :factors, :custom_formula, :string
  end
end
