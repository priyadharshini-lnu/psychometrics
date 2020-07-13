# frozen_string_literal: true

module EndUser
  class CampaignSerializer < ActiveModel::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :name, :type

    def type
      'common'
    end
  end
end
