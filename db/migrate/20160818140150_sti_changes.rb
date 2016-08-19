class StiChanges < ActiveRecord::Migration[5.0]
  def change
    change_column :users, :role, :string, default: 'Users::Member'
  end
end
