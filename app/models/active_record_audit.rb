# frozen_string_literal: true

class ActiveRecordAudit < Audited::Audit
  belongs_to :audit_log, foreign_key: 'request_uuid', primary_key: 'request_uuid', optional: true
  belongs_to :user, optional: true
end
