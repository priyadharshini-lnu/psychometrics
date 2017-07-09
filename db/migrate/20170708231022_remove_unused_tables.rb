class RemoveUnusedTables < ActiveRecord::Migration[5.0]
  def up
    drop_table :assign_clients
    drop_table :assign_clients_reports
  end

  def down
    raise 'No way back'
  end
end
