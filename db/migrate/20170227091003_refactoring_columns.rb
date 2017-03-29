class RefactoringColumns < ActiveRecord::Migration[5.0]
  def change
    rename_column :clients, :memberships_count, :users_count
    change_column_default(:clients, :children_count, from: nil, to: 0)
    Client.find_each { |client| Client.reset_counters(client.id, :memberships) }
    Client.reset_column_information
    Client.find_each { |client| Client.reset_counters(client.id, :children) }
  end
end
# client.update_attribute(:children_count, client.children.count
