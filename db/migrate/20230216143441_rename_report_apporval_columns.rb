class RenameReportApporvalColumns < ActiveRecord::Migration[6.1]
  def change
    rename_column :user_reports, :qc_status_owner_id, :qc_user_id
    rename_column :user_reports, :qc_status_updated_at, :qc_at
    rename_column :user_reports, :approval_status_owner_id, :approver_user_id
    add_column :user_reports, :approved_at, :datetime
  end
end
