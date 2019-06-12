module Threesixty
  class NominationSerializer < ActiveModel::Serializer
    attributes :id, :is_self
    has_many :evaluators, serializer: Threesixty::EndUser::NomineeSerializer
    has_many :relationships, serializer: RelationshipSerializer
    has_one :subject, serializer: UserSerializer
    has_one :options, serializer: CampaignOptionsSerializer
    has_one :requirements, serializer: Threesixty::EndUser::NominationRequirementSerializer

    def subject
      object.user
    end

    def is_self
      object.user_id == current_user.id
    end

    def relationships
      Relationships::ByCampaign.new(object.campaign)
    end

    def options
      object.campaign.threesixty_campaign.option
    end

    def requirements
      object.campaign.threesixty_campaign.nomination_requirements.first

      # TODO: replace mocked requirements with real
      # Threesixty::NominationRequirements::FindForSubject.call!(object)
    end
  end
end
