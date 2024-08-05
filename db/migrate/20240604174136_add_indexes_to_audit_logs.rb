class AddIndexesToAuditLogs < ActiveRecord::Migration[7.1]
  def change
    add_index :audit_logs, :record_type
    add_index :audit_logs, :record_id
  end
end
