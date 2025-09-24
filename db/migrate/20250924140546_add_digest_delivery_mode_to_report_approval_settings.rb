# frozen_string_literal: true

class AddDigestDeliveryModeToReportApprovalSettings < ActiveRecord::Migration[7.1]
  def change
    change_table :report_approval_settings, bulk: true do |t|
      t.string :digest_delivery_mode, default: 'immediate', null: true
      t.datetime :last_digest_sent_at, null: true
    end
  end
end
