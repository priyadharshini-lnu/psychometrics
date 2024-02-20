# frozen_string_literal: true

module EndUser
  class CampaignUserSerializer < Panko::Serializer
    attributes :id, :started_at, :status, :expiry_date, :examus_session_url, :all_preworks_completed

    def all_preworks_completed
      object.all_preworks_completed?
    end

    def expiry_date
      object.real_expiry_date
    end

    def status
      object.real_status
    end

    def examus_session_url
      context[:examus_session_url]
    end
  end
end
