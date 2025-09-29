# frozen_string_literal: true

class AddSendDigestEmailToReportApprovalSettings < ActiveRecord::Migration[7.1]
  def change
    add_column :report_approval_settings, :send_digest_emails, :boolean, default: false, null: false
  end
end
