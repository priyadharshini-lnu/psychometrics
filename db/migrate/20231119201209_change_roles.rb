class ChangeRoles < ActiveRecord::Migration[7.0]
  def change
    rename_table :roles, :admin_roles
    rename_table :users_roles, :user_admin_roles
    rename_column :user_admin_roles, :role_id, :admin_role_id

    add_reference :admin_roles, :membership, foreign_key: { on_delete: :cascade }
  end
end
