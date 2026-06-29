# frozen_string_literal: true

class AddReportTypeToDataReports < ActiveRecord::Migration[8.0]
  def change
    add_column :data_reports, :report_type, :integer, default: 0, null: false
    add_index :data_reports, :report_type
  end
end
