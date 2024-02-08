# frozen_string_literal: true

class ActiveRecordAuditSerializer < Panko::Serializer
  attributes :id, :auditable_type, :auditable_id, :action, :audited_changes

  def audited_changes
    ActiveRecordAuditLogs::ScrubSensitiveData.call!(object.audited_changes)
  end
end
