module Threesixty
  class CampaignSerializer < ActiveModel::Serializer
    class SubjectsSerializer < ActiveModel::Serializer
      attributes :id, :is_self, :campaign_id
      has_one :user, serializer: UserSerializer

      def campaign_id
        object.campaign.threesixty_campaign.id
      end

      def is_self
        object.id == current_user.id
      end
    end

    attributes :id, :evaluations, :reports, :nominations

    has_many :nominations, serializer: SubjectsSerializer
    has_many :evaluations, serializer: Threesixty::EvaluatorSerializer

    def nominations
      instance_options[:subjects] || []
    end

    def evaluations
      instance_options[:evaluations] || []
    end

    def reports
      instance_options[:reports] || []
    end
  end
end
