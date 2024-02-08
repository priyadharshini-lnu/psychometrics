class DropMembershipIdFromAdminRole < ActiveRecord::Migration[7.1]
  def change
    remove_column :admin_roles, :membership_id
    drop_table :user_admin_roles

    create_table :memberships_admin_roles do |t|
      t.references :membership, null: false, foreign_key: { on_delete: :cascade }
      t.references :admin_role, null: false, foreign_key: { on_delete: :cascade }

      t.timestamps
    end
  end
end
