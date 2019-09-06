
module Threesixty
  class CampaignOptionsSerializer < ActiveModel::Serializer
    attributes :participants, :reports, :messages
  end
end
