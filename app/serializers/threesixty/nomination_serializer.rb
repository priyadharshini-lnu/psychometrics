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
      relationships = Relationships::ByCampaign.new(object.campaign).to_a
      {
        subject_conditions: {},
        conditions: [
          {type: 'relationship', id: relationships[0].id, predicate: 'at_least', value: 2},
          {type: 'relationship', id: relationships[1].id, predicate: 'at_least', value: 1},
          {type: 'relationship', id: relationships[2].id, predicate: 'at_least', value: 2},
        ]
      }
    end
  end
end
