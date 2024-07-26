# frozen_string_literal: true

class AddCompositeIndexToAuditLogs < ActiveRecord::Migration[7.1]
  def change
    add_index :audit_logs, %i[user_id action created_at]

    DeploymentTask.add("RunRefreshAuditLogCacheJob.new.perform_now to cache record_type and action")
  end
end
