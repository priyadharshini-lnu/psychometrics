class AddAncestryToFactor < ActiveRecord::Migration[5.0]
  def change
    add_column :factors, :parent_id, :string
    add_index :factors, :parent_id
  end
end
