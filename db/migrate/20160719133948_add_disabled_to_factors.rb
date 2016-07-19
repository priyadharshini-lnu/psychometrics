class AddDisabledToFactors < ActiveRecord::Migration[5.0]
  def change
    add_column :factors, :disabled, :boolean, default: false
  end
end
