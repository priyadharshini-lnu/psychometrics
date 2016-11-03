class AddAccessReportsAtToAssessments < ActiveRecord::Migration[5.0]
  def change
    add_column :assessments, :access_reports_at, :datetime, default: nil
  end
end
