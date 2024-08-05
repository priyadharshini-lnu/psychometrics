class RemoveIndexAuditLogsOnRecordTypeAndRecordId < ActiveRecord::Migration[7.1]
  def change
    remove_index :audit_logs, name: 'index_audit_logs_on_record_type_and_record_id'
  end
end
