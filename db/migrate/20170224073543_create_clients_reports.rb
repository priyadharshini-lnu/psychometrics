class CreateClientsReports < ActiveRecord::Migration[5.0]
  def change
    create_table :clients_reports do |t|
      t.references :client
      t.references :report
      t.timestamps
    end
  end
end
