# frozen_string_literal: true

class ChangeDataReportsFieldsToBigint < ActiveRecord::Migration[8.0]
  def up
    change_table :data_report_jobs, bulk: true do |t|
      t.change :data_report_id, :bigint
      t.change :created_by_id, :bigint
      t.change :admin_job_record_id, :bigint
    end

    change_table :data_reports, bulk: true do |t|
      t.change :owner_id, :bigint
      t.change :last_updated_by_id, :bigint
    end
  end

  def down
    change_table :data_report_jobs, bulk: true do |t|
      t.change :data_report_id, :integer
      t.change :created_by_id, :integer
      t.change :admin_job_record_id, :integer
    end

    change_table :data_reports, bulk: true do |t|
      t.change :owner_id, :integer
      t.change :last_updated_by_id, :integer
    end
  end
end
