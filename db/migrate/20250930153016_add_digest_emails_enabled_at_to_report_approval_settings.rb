# frozen_string_literal: true

class AddDigestEmailsEnabledAtToReportApprovalSettings < ActiveRecord::Migration[7.1]
  def change
    add_column :report_approval_settings, :digest_emails_enabled_at, :datetime, null: true
  end
end
