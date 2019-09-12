# frozen_string_literal: true

class AddExternalReportToAssignsReports < ActiveRecord::Migration[5.1]
  def change
    add_column :assigns_reports, :external_report, :string
  end
end
