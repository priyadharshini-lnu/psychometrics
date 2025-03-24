# frozen_string_literal: true

class AddAllowBulkApproveToReportApprovalSettings < ActiveRecord::Migration[7.1]
  def change
    change_table :report_approval_settings, bulk: true do |t|
      t.boolean :allow_bulk_approve, default: false
      t.boolean :allow_qc_bulk_submit, default: false
    end
  end
end
