class AddParentToClient < ActiveRecord::Migration[5.0]
  def change
    add_column :clients, :parent_id, :integer, index: true
  end
end
