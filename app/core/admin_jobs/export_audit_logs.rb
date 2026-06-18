# frozen_string_literal: true

module AdminJobs
  class ExportAuditLogs < BaseExportCsv
    def generate_details
      [[I18n.t('admin.audit_logs'), file_link]]
    end

    private

    def headers
      [
        'Record ID',
        'Record Type',
        'Action',
        'Date',
        'User',
        'Client',
        'Project',
        'Campaign'
      ]
    end

    def data_row(log)
      [
        log.record_id,
        log.record_type,
        log.action,
        log.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        log.user&.email || log.user_id,
        log.client&.name || log.client_id,
        log.project&.name || log.project_id,
        log.campaign&.name || log.campaign_id
      ]
    end

    def records_for_export
      filters = record.data['filters'] || {}
      audit_logs_scope.ransack(filters).result.order(created_at: :desc)
    end

    def audit_logs_scope
      Administration::AuditLogPolicy::Scope.new(owner, ::AuditLog).resolve
    end

    def file_name
      'audit_logs.csv'
    end
  end
end
