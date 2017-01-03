class AddOwnerIdToTasks < ActiveRecord::Migration[5.0]
  def change
    add_reference :tasks, :owner, references: :memberships, index: true
    add_foreign_key :tasks, :memberships, column: :owner_id
  end
end
