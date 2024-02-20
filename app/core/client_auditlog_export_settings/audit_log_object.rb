# frozen_string_literal: true

module ClientAuditlogExportSettings
  class AuditLogObject < BaseCommand
    private_attr_reader :record

    def initialize(record)
      @record = record
    end

    def call
      extracted_logs = []
      request_audit_logs = request_audit_logs(record)
      active_record_audit_logs = active_record_audit_logs(record)
      extracted_logs << request_audit_logs
      extracted_logs.concat(active_record_audit_logs)

      broadcast :ok, extracted_logs
    end

    private

    def request_audit_logs(record)
      {
        id: record.id,
        log_type: 'request',
        request_uuid: record.request_uuid,
        user_id: record.user_id,
        record_id: record.record_id,
        record_type: record.record_type,
        action: record.action,
        payload: record.payload,
        client_ip: record.client_ip,
        outcome: record.outcome,
        failure_reason: record.failure_reason,
        interface: record.interface,
        user_agent: record.user_agent
      }
    end

    def active_record_audit_logs(record)
      record.active_record_audits.map do |active_record_audit|
        audited_changes = active_record_audit_values(active_record_audit)
        audited_changes = ActiveRecordAuditLogs::ScrubSensitiveData.call!(audited_changes)

        {
          id: active_record_audit.id,
          log_type: 'changeset',
          request_uuid: active_record_audit.request_uuid,
          record_id: active_record_audit.auditable_id,
          record_type: active_record_audit.auditable_type,
          old_value: audited_changes[:old_value],
          new_value: audited_changes[:new_value]
        }
      end
    end

    def active_record_audit_values(active_record_audit)
      audited_changes = { old_value: {}, new_value: {} }

      case active_record_audit.action
        when 'create'
          active_record_audit.audited_changes.each do |key, new_value|
            audited_changes[:new_value][key] = new_value
          end
        when 'update'
          active_record_audit.audited_changes.each do |key, (old_value, new_value)|
            audited_changes[:old_value][key] = old_value
            audited_changes[:new_value][key] = new_value
          end
        when 'destroy'
          active_record_audit.audited_changes.each do |key, old_value|
            audited_changes[:old_value][key] = old_value
          end
      end

      audited_changes
    end
  end
end
