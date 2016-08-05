class AddHrisToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :hris, :jsonb, default: '{}'
    add_index  :users, :hris, using: :gin
  end
end
