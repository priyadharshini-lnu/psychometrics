class AddMembershipsCountToClients < ActiveRecord::Migration[5.0]
  def change
    add_column :clients, :memberships_count, :integer, default: 0
  end
end
