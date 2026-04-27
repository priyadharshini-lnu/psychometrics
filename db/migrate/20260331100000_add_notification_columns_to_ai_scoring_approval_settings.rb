# frozen_string_literal: true

class AddNotificationColumnsToAIScoringApprovalSettings < ActiveRecord::Migration[8.0]
  def change
    change_table :ai_scoring_approval_settings, bulk: true do |t|
      t.bigint :approval_notification_user_ids, array: true, default: [], null: false
      t.boolean :do_not_send_notifications, default: false, null: false
    end
  end
end
