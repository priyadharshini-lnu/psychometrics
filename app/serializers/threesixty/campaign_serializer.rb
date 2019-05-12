module Threesixty
  class CampaignSerializer < ActiveModel::Serializer
    class NomineeSerializer < ActiveModel::Serializer
      attributes :id, :is_self, :campaign_id
      has_one :user, serializer: UserSerializer

      def campaign_id
        object.campaign.threesixty_campaign.id
      end

      def is_self
        object.user_id == current_user.id
      end
    end

    class EvaluationSerializer < ActiveModel::Serializer
      attributes :id, :is_self, :campaign_id
      has_one :user, serializer: UserSerializer

      def user
        object.subject
      end

      def campaign_id
        object.campaign.threesixty_campaign.id
      end

      def is_self
        object.subject_id == current_user.id
      end
    end

    attributes :id, :reports, :option

    has_many :nominations, serializer: NomineeSerializer
    has_many :evaluations, serializer: EvaluationSerializer

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
