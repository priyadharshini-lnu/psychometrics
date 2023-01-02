class RemoveRequireApprovalFromUserReports < ActiveRecord::Migration[6.1]
  def change
    remove_column :reports, :require_approval, :boolean
    remove_column :user_reports, :approved, :boolean
  end
end
