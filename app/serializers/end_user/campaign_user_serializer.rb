# frozen_string_literal: true

module EndUser
  class CampaignUserSerializer < ActiveModel::Serializer
    attributes :id, :campaign_id, :user_id, :active, :started_at, :completed_at,
               :completed_via, :completion_status, :additional_time, :expiry_date
  end
end
