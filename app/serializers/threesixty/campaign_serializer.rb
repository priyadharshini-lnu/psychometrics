module Threesixty
  class CampaignSerializer < ActiveModel::Serializer
    attributes :id, :nominations, :evaluations, :reports

    def nominations
      []
    end

    def evaluations
      []
    end

    def reports
      []
    end
  end
end
