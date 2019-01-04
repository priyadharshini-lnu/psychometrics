module Api
  module V1
    class CampaignSerializer < ActiveModel::Serializer
      attributes :id, :name, :created_at, :updated_at

    end
  end
end
