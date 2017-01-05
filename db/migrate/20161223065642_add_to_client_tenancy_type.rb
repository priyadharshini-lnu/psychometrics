class AddToClientTenancyType < ActiveRecord::Migration[5.0]
  def change
    add_column :clients, :type, :integer, default: 0
  end
end
