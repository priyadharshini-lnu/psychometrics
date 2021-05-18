# frozen_string_literal: true

module EndUser
  class ProctoredCampaignUserSerializer < ActiveModel::Serializer
    attributes :id, :started_at, :expiry_date, :status

    attribute :jwt_token, unless: -> { instance_options[:jwt_token].blank? }
    attribute :session_id, unless: -> { instance_options[:session_id].blank? }

    def expiry_date
      object.real_expiry_date
    end

    def jwt_token
      instance_options[:jwt_token]
    end

    def session_id
      instance_options[:session_id]
    end
  end
end
