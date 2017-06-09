class AddConstraintOwnerToLibraries < ActiveRecord::Migration[5.0]
  def change
    add_foreign_key :libraries, :clients, column: :owner_id, on_delete: :nullify
  end
end
