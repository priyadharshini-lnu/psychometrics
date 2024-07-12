# frozen_string_literal: true

class AuditLogSerializer < Panko::Serializer
  include Shared::AuditLogSerializers

  attributes :id, :action,
             :record_id, :record_type, :user_id, :created_at

  has_one :client, serializer: Shared::AuditLogSerializers::ClientSerializer
  has_one :project, serializer: Shared::AuditLogSerializers::ProjectSerializer
  has_one :campaign, serializer: Shared::AuditLogSerializers::CampaignSerializer
  has_one :user, serializer: Shared::AuditLogSerializers::UserSerializer
end
