class AddMembershipsCountToClients < ActiveRecord::Migration[5.0]
  def change
    add_column :clients, :memberships_count, :integer, default: 0
    Client.find_each { |client| Client.reset_counters(client.id, :memberships) }
  end
end
