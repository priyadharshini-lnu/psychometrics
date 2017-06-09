class AddConstraintOwnerToDimensions < ActiveRecord::Migration[5.0]
  def change
    add_foreign_key :dimensions, :clients, column: :owner_id, on_delete: :nullify
  end
end
