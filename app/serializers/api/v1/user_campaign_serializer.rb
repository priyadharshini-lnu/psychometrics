# frozen_string_literal: true

module Api
  module V1
    class UserCampaignSerializer < Panko::Serializer
      attributes :id, :name, :created_at, :updated_at
    end
  end
end
