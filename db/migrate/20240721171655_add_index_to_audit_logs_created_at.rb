# frozen_string_literal: true

class AddIndexToAuditLogsCreatedAt < ActiveRecord::Migration[7.1]
  def change
    add_index :audit_logs, :created_at unless index_exists?(:audit_logs, :created_at)
  end
end
