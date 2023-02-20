class AddQcOwnerToUserReports < ActiveRecord::Migration[6.1]
  def change
    add_column :user_reports, :qc_status_owner_id, :integer
    add_column :user_reports, :qc_status_updated_at, :datetime
  end
end
