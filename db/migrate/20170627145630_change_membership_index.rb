class ChangeMembershipIndex < ActiveRecord::Migration[5.0]
  def change
    remove_index :memberships, column: [:client_id, :user_id]
    remove_index :memberships, column: :client_id
    remove_index :memberships, column: :user_id
    add_index :memberships, [:client_id, :user_id, :role], unique: true, name: 'index_memberships_uniq'
  end
end
