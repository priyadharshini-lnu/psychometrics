# frozen_string_literal: true

class AddQcLevelSettingsToReportApprovalSettings < ActiveRecord::Migration[7.1]
  def change
    add_column :report_approval_settings, :approvers_can_edit, :boolean, default: false
    add_column :report_approval_settings, :approvers_not_required, :boolean, default: false
    add_column :report_approval_settings, :do_not_send_notifications, :boolean, default: false
  end
end
