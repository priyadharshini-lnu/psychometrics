class AddHiearchyToMemberships < ActiveRecord::Migration[5.0]
  def self.up
    add_column :memberships, :parent_id, :integer
    add_column :memberships, :lft, :integer
    add_column :memberships, :rgt, :integer

    # optional fields
    add_column :memberships, :depth, :integer
    add_column :memberships, :children_count, :integer

    add_index :memberships, :parent_id
    add_index :memberships, :lft
    add_index :memberships, :rgt

    # This is necessary to update :lft and :rgt columns
    # Membership.rebuild!
  end

  def self.down
    remove_column :memberships, :parent_id
    remove_column :memberships, :lft
    remove_column :memberships, :rgt

    # optional fields
    remove_column :memberships, :depth
    remove_column :memberships, :children_count
  end
end
