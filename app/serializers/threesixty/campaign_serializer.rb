module Threesixty
  class CampaignSerializer < ActiveModel::Serializer
    class NomineeSerializer < ActiveModel::Serializer
      attributes :id, :is_self, :campaign_id, :evaluators_count
      has_one :user, serializer: UserSerializer

      def campaign_id
        object.campaign.threesixty_campaign.id
      end

      def is_self
        object.user_id == current_user.id
      end
    end

    attributes :id, :reports, :type, :assessment_name, :questions_count, :timing,
               :mindmill, :hogan

    has_many :nominations, serializer: NomineeSerializer
    has_many :evaluations, serializer: Threesixty::EndUser::EvaluationSerializer
    has_many :reports, serializer: UsersReportSerializer
    has_one :options, serializer: CampaignOptionsSerializer

    def type
      ::Campaign::THREESIXTY
    end

    def options
      object.option
    end

    def assessment_name
      object.assessment.name
    end

    def mindmill
      object.assessment.mindmill?
    end

    def hogan
      object.assessment.hogan?
    end

    def questions_count
      object.assessment.questions.count
    end

    def timing
      object.assessment.timing
    end


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
