# frozen_string_literal: true

class ActiveRecordAudit < Audited::Audit
  belongs_to :user, optional: true
  acts_as_tenant(:tenant, class_name: 'Client', foreign_key: :tenant_id, optional: true)
  include Tenantable

  scope :geo_restricted_for, lambda { |country = Current.user_country|
    where(tenant_id: Client.restricted_clients(country).select(:id))
  }

  tenant_source :auditable, :user

  belongs_to :audit_log, foreign_key: 'request_uuid', primary_key: 'request_uuid', optional: true
end
