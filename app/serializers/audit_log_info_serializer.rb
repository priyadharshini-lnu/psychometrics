# frozen_string_literal: true

class AuditLogInfoSerializer < Panko::Serializer
  include Shared::AuditLogSerializers

  attributes :id, :action, :campaign_id, :client_id, :payload, :project_id,
             :record_id, :record_type, :request, :user_id, :created_at, :request_uuid, :client_ip, :interface,
             :user_agent, :outcome, :failure_reason

  has_one :client, serializer: Shared::AuditLogSerializers::ClientSerializer
  has_one :project, serializer: Shared::AuditLogSerializers::ProjectSerializer
  has_one :campaign, serializer: Shared::AuditLogSerializers::CampaignSerializer
  has_one :user, serializer: Shared::AuditLogSerializers::UserSerializer
  has_one :impersonator, serializer: Shared::AuditLogSerializers::UserSerializer

  has_many :active_record_audits, each_serializer: ActiveRecordAuditSerializer

  def failure_reason
    return if object.failure_reason.blank?

    I18n.t("audit_log_failures.#{object.failure_reason}", default: object.failure_reason)
  end
end
