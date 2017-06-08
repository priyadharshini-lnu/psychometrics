class AddAncestryToLibraries < ActiveRecord::Migration[5.0]
  def up
    add_column :libraries, :ancestry, :string
    add_index :libraries, :ancestry

    Library.build_ancestry_from_parent_ids!

    remove_column :libraries, :parent_id
    remove_column :libraries, :lft
    remove_column :libraries, :rgt
    remove_column :libraries, :depth
    remove_column :libraries, :children_count
  end

  def down
    raise IrreversibleMigration
  end
end
