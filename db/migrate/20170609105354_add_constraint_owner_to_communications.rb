class AddConstraintOwnerToCommunications < ActiveRecord::Migration[5.0]
  def change
    add_foreign_key :communications, :clients, column: :owner_id, on_delete: :nullify
  end
end
