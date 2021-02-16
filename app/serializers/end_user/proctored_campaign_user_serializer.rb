# frozen_string_literal: true

module EndUser
  class ProctoredCampaignUserSerializer < ActiveModel::Serializer
    attributes :id, :campaign_id, :user_id, :active, :started_at, :completed_at,
               :completion_status, :additional_time, :expiry_date

    attribute :jwt_token, unless: -> { instance_options[:jwt_token].blank? }
    attribute :session_id, unless: -> { instance_options[:session_id].blank? }

    def jwt_token
      instance_options[:jwt_token]
    end

    def session_id
      instance_options[:session_id]
    end
  end
end
