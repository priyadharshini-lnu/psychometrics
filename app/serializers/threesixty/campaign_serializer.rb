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

    attributes :id, :reports, :instructions

    has_many :nominations, serializer: NomineeSerializer
    has_many :evaluations, serializer: Threesixty::EndUser::EvaluationSerializer
    has_many :reports, serializer: UsersReportSerializer
    has_one :options, serializer: CampaignOptionsSerializer

    def instructions
      object.instruction_templates.map do |instruction|
        {
          name: instruction.name,
          content: Threesixty::PipedText::Perform.call!(instruction.content,
                      threesixty_campaign: object.campaign.threesixty_campaign)
        }
      end
    end

    def options
      object.option
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
