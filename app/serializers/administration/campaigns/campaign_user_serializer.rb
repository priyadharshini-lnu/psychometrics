# frozen_string_literal: true

module Administration
  module Campaigns
    class CampaignUserSerializer < ActiveModel::Serializer
      attributes :campaign_id, :user_id, :active, :started_at, :completed_at, :completion_status,
                 :additional_time, :status

      belongs_to :user, serializer: UserSerializer
    end
  end
end
