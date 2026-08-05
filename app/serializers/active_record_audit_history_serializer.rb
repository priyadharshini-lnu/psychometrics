# frozen_string_literal: true

class ActiveRecordAuditHistorySerializer < Panko::Serializer
  attributes :id, :version, :action, :auditable_type, :auditable_id, :auditable_name,
             :created_at, :request_uuid, :audited_changes, :audit_log_id

  has_one :user, serializer: Shared::AuditLogSerializers::UserSerializer

  def audited_changes
    ActiveRecordAuditLogs::ScrubSensitiveData.call!(object.audited_changes)
  end

  def audit_log_id
    object.audit_log&.id
  end

  def auditable_name
    object.auditable&.try(:name)
  end
end
