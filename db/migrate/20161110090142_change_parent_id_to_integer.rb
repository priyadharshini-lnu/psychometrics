class ChangeParentIdToInteger < ActiveRecord::Migration[5.0]
  def self.up
    change_column :factors, :parent_id, 'integer USING CAST(parent_id AS integer)'
  end

  def self.down
    change_column :factors, :parent_id, :string
  end
end
