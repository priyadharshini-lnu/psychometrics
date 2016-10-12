class AddBackgroundToClients < ActiveRecord::Migration[5.0]
  def change
    add_column :clients, :background, :string
  end
end
