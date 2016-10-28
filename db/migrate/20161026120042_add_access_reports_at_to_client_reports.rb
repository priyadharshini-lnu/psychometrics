class AddAccessReportsAtToClientReports < ActiveRecord::Migration[5.0]
  def change
    add_column :client_reports, :access_reports_at, :datetime, default: nil
  end
end
