class AddAncestryToMemberships < ActiveRecord::Migration[5.0]
  def up
    add_column :memberships, :ancestry, :string
    add_index :memberships, :ancestry

    Membership.build_ancestry_from_parent_ids!

    remove_column :memberships, :parent_id
    remove_column :memberships, :lft
    remove_column :memberships, :rgt
    remove_column :memberships, :depth
    remove_column :memberships, :children_count
  end

  def down
    raise IrreversibleMigration
  end
end
