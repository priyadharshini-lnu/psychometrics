# frozen_string_literal: true

class AuditLogSerializer < ActiveModel::Serializer
  class ClientSerializer < ActiveModel::Serializer
    attributes :id, :name
  end

  class ProjectSerializer < ActiveModel::Serializer
    attributes :id, :name
  end

  class CampaignSerializer < ActiveModel::Serializer
    attributes :id, :name, :project_id
  end

  class UserSerializer < ActiveModel::Serializer
    attributes :email, :full_name

    def full_name
      object.decorate.full_name
    end
  end

  attributes :id, :action, :campaign_id, :client_id, :payload, :project_id,
             :record_id, :record_type, :request, :user_id, :created_at, :request_uuid, :client_ip, :interface,
             :user_agent, :outcome, :failure_reason

  has_one :client, Serializer: ClientSerializer
  has_one :project, Serializer: ProjectSerializer
  has_one :campaign, Serializer: CampaignSerializer
  has_one :user, Serializer: UserSerializer

  has_many :active_record_audits, Serializer: ActiveRecordAuditSerializer

  def failure_reason
    return if object.failure_reason.blank?

    I18n.t("audit_log_failures.#{object.failure_reason}", default: object.failure_reason)
  end
end
