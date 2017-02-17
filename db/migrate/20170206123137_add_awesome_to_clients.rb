class AddAwesomeToClients < ActiveRecord::Migration[5.0]
  def change
    remove_column :clients, :parent_id

    add_column :clients, :parent_id, :integer # Comment this line if your project already has this column

    add_column :clients, :lft,       :integer
    add_column :clients, :rgt,       :integer

    # optional fields
    add_column :clients, :depth,          :integer
    add_column :clients, :children_count, :integer

    # This is necessary to update :lft and :rgt columns
    Client.rebuild!
  end
end
