class CreateRoles < ActiveRecord::Migration[7.0]
  def change
    create_table :roles do |t|
      t.string :name
      t.text :description
      t.references :client, foreign_key: true, on_delete: :cascade
      t.jsonb :permissions
    end

    add_index :roles, [:name, :client_id], unique: true

    create_join_table :users, :roles, table_name: :users_roles do |t|
      t.index :user_id
      t.index :role_id
    end

    add_foreign_key :users_roles, :users, on_delete: :cascade
    add_foreign_key :users_roles, :roles, on_delete: :restrict
  end
end
