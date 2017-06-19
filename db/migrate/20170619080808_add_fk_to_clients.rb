class AddFkToClients < ActiveRecord::Migration[5.0]
  def change
    add_foreign_key :clients, :users, column: :account_manager_id, on_delete: :nullify
    add_foreign_key :clients, :users, column: :project_manager_id, on_delete: :nullify
  end
end
