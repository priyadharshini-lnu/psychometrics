# frozen_string_literal: true

class AuditLogSerializer < ActiveModel::Serializer
  class ClientSerizlier < ActiveModel::Serializer
    attributes :id, :name
  end

  class ProjectSerizlier < ActiveModel::Serializer
    attributes :id, :name
  end

  class CampaignSerizlier < ActiveModel::Serializer
    attributes :id, :name
  end

  attributes :id, :action, :campaign_id, :client_id, :payload, :project_id,
             :record_id, :record_type, :request, :user_id, :user_name

  has_one :client, serizlier: ClientSerizlier
  has_one :project, serizlier: ProjectSerizlier
  has_one :campaign, serizlier: CampaignSerizlier

  def user_name
    object.user&.decorate&.full_name
  end
end
