class AddClientIdToUser < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :project_id, :integer
    add_index :users, [:project_id, :email], unique: true
    remove_index :users, :email
    add_foreign_key :users, :clients, column: :project_id, foreign_key: { on_delete: :cascade }

  end
end
