# frozen_string_literal: true

class CreateBulkReportJobs < ActiveRecord::Migration[8.0]
  def change
    create_table :bulk_report_jobs do |t|
      t.references :project, null: true, foreign_key: { to_table: :clients, on_delete: :cascade }
      t.integer :admin_job_record_id
      t.integer :bulk_report_id
      t.integer :created_by_id
      t.string :start_date
      t.string :end_date
      t.bigint :tenant_id

      t.timestamps
    end

    add_index :bulk_report_jobs, :tenant_id
  end
end
