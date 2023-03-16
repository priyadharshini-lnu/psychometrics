class RemoveUnusedFieldsFromClients < ActiveRecord::Migration[6.1]
  def change
    remove_column :clients, :design
    remove_column :clients, :logo
    remove_column :clients, :background
    remove_column :clients, :secondary_logo
    remove_column :clients, :design_migrated
  end
end
