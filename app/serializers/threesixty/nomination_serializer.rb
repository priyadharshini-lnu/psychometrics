module Threesixty
  class NominationSerializer < ActiveModel::Serializer
    attributes :id, :is_self, :requirements
    has_many :evaluators, serializer: Threesixty::EndUser::NomineeSerializer
    has_many :relationships, serializer: RelationshipSerializer
    has_one :subject, serializer: UserSerializer
    has_one :options, serializer: CampaignOptionsSerializer

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

    # TODO: replace mocked requirements with real
    def requirements
      {
        subject_conditions: {},
        conditions: [
          {type: 'relationship', id: 4, predicate: 'at_least', value: 2},
          {type: 'relationship', id: 1, predicate: 'at_least', value: 1},
          {type: 'relationship', id: 2, predicate: 'at_least', value: 2},
        ]
      }
    end
  end
end
