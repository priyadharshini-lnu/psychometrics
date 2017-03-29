class AddGrantsToMembership < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :grants, :jsonb
    add_index :users, :grants, using: :gin
  end
end
