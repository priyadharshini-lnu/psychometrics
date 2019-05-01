module Threesixty
  class NominationSerializer < ActiveModel::Serializer
    attributes :id, :is_self, :requirements
    has_many :evaluators, serializer: Threesixty::EndUser::NominantSerializer
    has_many :relationships, serializer: RelationshipSerializer
    has_one :subject, serializer: UserSerializer

    def subject
      object.user
    end

    def is_self
      object.user_id == current_user.id
    end

    def relationships
      Relationship.all
    end

    # TODO: replace mocked requirements with real
    def requirements
      {
        subject_conditions: {},
        conditions: [
          {type: 'relationship', name: 'Customer', predicate: 'at_least', value: 1},
          {type: 'relationship', name: 'DirectReport', predicate: 'at_least', value: 2},
          {type: 'relationship', name: 'Manager', predicate: 'at_least', value: 1},
          {type: 'relationship', name: 'Peer', predicate: 'at_least', value: 2},
        ]
      }
    end
  end
end
