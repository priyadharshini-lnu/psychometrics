class AddAncestryToClients < ActiveRecord::Migration[5.0]
  def up
    add_column :clients, :ancestry, :string
    add_column :clients, :ancestry_depth, :integer, default: 0
    add_index :clients, :ancestry

    Client.build_ancestry_from_parent_ids!
    Client.rebuild_depth_cache!

    remove_column :clients, :parent_id
    remove_column :clients, :lft
    remove_column :clients, :rgt
    remove_column :clients, :depth
    remove_column :clients, :children_count
  end

  def down
    raise IrreversibleMigration
  end
end
