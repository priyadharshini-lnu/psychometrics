# frozen_string_literal: true

module EndUser
  class ShortCampaignSerializer < ActiveModel::Serializer
    attributes :id, :name, :type, :status
  end
end
