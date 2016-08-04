class EditForeignKeys < ActiveRecord::Migration[5.0]
  def change
    remove_foreign_key :norms, column: :created_by
    remove_foreign_key :norms, column: :updated_by
    add_foreign_key :norms, :users, column: :created_by, on_delete: :nullify
    add_foreign_key :norms, :users, column: :updated_by, on_delete: :nullify
  end
end
