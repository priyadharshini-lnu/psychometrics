# frozen_string_literal: true

class AddFileToDataReportJobs < ActiveRecord::Migration[7.1]
  def change
    add_column :data_report_jobs, :file, :string
  end
end
