class AddAssignStatusToRelationship < ActiveRecord::Migration[5.1]
  def change
    add_column :relationships, :assign_type, :integer, default: 0
  end
end
