class AddAnonymToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :is_anonym, :boolean, default: false
  end
end
