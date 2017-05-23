class AddRootIdToClient < ActiveRecord::Migration[5.0]
  def up
    add_column :clients, :tte_id, :integer
    add_index :clients, :tte_id
    Client.where.not(parent_id: nil).each do |client|
      client.update_attribute(:tte_id, client.root.id)
    end
  end

  def down
    remove_column :clients, :tte_id
  end
end
