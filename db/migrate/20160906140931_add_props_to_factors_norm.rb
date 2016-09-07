class AddPropsToFactorsNorm < ActiveRecord::Migration[5.0]
  def change
    add_column :factors_norms, :props, :json
  end
end
