class DropUsersUnusedColumns < ActiveRecord::Migration[7.1]
  def change
    remove_column :users, :photo
    remove_column :users, :locale
  end
end
