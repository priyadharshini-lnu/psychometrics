# frozen_string_literal: true

module EndUser
  class CampaignUserSerializer < ActiveModel::Serializer
    attributes :id, :started_at, :status, :expiry_date, :examus_session_url

    def expiry_date
      object.real_expiry_date
    end

    def status
      object.real_status
    end

    def examus_session_url
      instance_options[:examus_session_url]
    end
  end
end
