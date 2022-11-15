class ChangeIdTypeForReportApprovalSetting < ActiveRecord::Migration[6.1]
  def change
    remove_column :report_approval_settings, :qc_user_ids
    remove_column :report_approval_settings, :approver_user_ids
    remove_column :report_approval_settings, :approval_notification_user_ids

    add_column :report_approval_settings, :qc_user_ids, :bigint, array: true, default: []
    add_column :report_approval_settings, :approver_user_ids, :bigint, array: true, default: []
    add_column :report_approval_settings, :approval_notification_user_ids, :bigint, array: true, default: []
  end
end
