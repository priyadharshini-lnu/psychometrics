class AddOwnerIdToBlocks < ActiveRecord::Migration[6.1]
  def change
    add_column :blocks, :owner_id, :integer
  end
end
