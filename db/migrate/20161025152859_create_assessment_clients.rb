class CreateAssessmentClients < ActiveRecord::Migration[5.0]
  def up
    create_table :assessment_clients do |t|
      t.belongs_to :assessment
      t.belongs_to :client
      t.timestamps
    end
    # Now populate it with a SQL one-liner!
    execute 'INSERT INTO assessment_clients(assessment_id, client_id, created_at, updated_at)
      SELECT assessment_id, client_id, LOCALTIMESTAMP, LOCALTIMESTAMP FROM assessments_clients'

    # drop the old table
    drop_table :assessments_clients
  end

  def down
    # This leaves the id and timestamps fields intact
    rename_table :assessment_clients, :assessments_clients
  end
end
