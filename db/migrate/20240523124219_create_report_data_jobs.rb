# frozen_string_literal: true

class CreateReportDataJobs < ActiveRecord::Migration[7.1]
  def change
    create_table :data_report_jobs do |t|
      t.integer :data_report_id
      t.integer :status, default: 0
      t.integer :admin_job_record_id
      t.integer :created_by_id
      t.string :password

      t.timestamps
    end
  end
end
