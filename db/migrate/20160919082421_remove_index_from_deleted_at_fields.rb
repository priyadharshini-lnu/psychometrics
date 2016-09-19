class RemoveIndexFromDeletedAtFields < ActiveRecord::Migration[5.0]
  def change
    remove_index :blocks, :deleted_at
    remove_index :questions, :deleted_at
  end
end
