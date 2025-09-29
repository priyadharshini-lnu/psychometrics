# frozen_string_literal: true

class AddDigestOptionsToReportApprovalSettings < ActiveRecord::Migration[7.1]
  def change
    change_table :report_approval_settings, bulk: true do |t|
      t.string  :digest_frequency, default: 'daily', null: true
      t.time    :digest_time, default: '09:00 PM', null: true
      t.integer :digest_weekdays, array: true, default: [], null: true
      t.string  :digest_timezone, default: 'Asia/Dubai', null: true
    end
  end
end
