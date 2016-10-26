class CreateClientReports < ActiveRecord::Migration[5.0]
  def up
    create_table :client_reports do |t|
      t.belongs_to :client
      t.belongs_to :report
      t.timestamps
    end
    # Now populate it with a SQL one-liner!
    execute 'INSERT INTO client_reports(client_id, report_id, created_at, updated_at)
      SELECT client_id, report_id, LOCALTIMESTAMP, LOCALTIMESTAMP FROM clients_reports'

    # drop the old table
    drop_table :clients_reports
  end

  def down
    # This leaves the id and timestamps fields intact
    rename_table :client_reports, :clients_reports
  end
end
