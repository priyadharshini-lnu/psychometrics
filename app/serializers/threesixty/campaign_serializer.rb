module Threesixty
  class CampaignSerializer < ActiveModel::Serializer
    attributes :id, :evaluations, :reports, :nominations
    has_many :nominations, serializer: Threesixty::NominationSerializer

    def nominations
      instance_options[:nominations] || []
    end

    def evaluations
      instance_options[:evaluations] || []
    end

    def reports
      instance_options[:reports] || []
    end
  end
end
