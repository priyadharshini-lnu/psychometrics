class CreateClientsReportsJoinTable < ActiveRecord::Migration[5.0]
  def change
    create_table :clients_reports, id: false do |t|
      t.integer :client_id
      t.integer :report_id
    end
    add_index :clients_reports, [:client_id, :report_id]
  end
end
