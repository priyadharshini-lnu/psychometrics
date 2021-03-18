# frozen_string_literal: true

module EndUser
  class CampaignUserSerializer < ActiveModel::Serializer
    attributes :id, :started_at, :status, :expiry_date

    def expiry_date
      object.real_expiry_date
    end

    def status
      object.real_status
    end
  end
end
