class AddConstraintOwnerToReports < ActiveRecord::Migration[5.0]
  def change
    add_foreign_key :reports, :clients, column: :owner_id, on_delete: :nullify
  end
end
