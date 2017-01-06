class AddAccessReportsToAssignsReports < ActiveRecord::Migration[5.0]
  def change
    add_column :assigns_reports, :access_reports_at, :datetime, default: nil
  end
end
