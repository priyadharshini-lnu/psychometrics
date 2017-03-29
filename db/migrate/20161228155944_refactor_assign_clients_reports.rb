class RefactorAssignClientsReports < ActiveRecord::Migration[5.0]
  def change
    create_table :assign_clients_reports do |t|
      t.belongs_to :report
      t.belongs_to :assign_client
      t.timestamps
    end
  end
end
