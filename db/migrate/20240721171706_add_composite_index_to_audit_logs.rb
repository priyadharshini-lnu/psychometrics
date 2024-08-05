# frozen_string_literal: true

class AddCompositeIndexToAuditLogs < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  def change
    add_index :audit_logs, %i[user_id action created_at], algorithm: :concurrently

    # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
    DeploymentTask.add('Run RefreshAuditLogCacheJob.new.perform_now to cache record_type and action')
    # rubocop:enable CustomRubocops/AvoidActiveRecordInMigrations
  end
end
