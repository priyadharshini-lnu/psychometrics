class AddUniqIndexToAssignsReports < ActiveRecord::Migration[5.0]
  def change
    add_index :assigns_reports, [:report_id, :assign_id], unique: true
  end
end
