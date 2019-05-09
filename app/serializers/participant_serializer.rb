# frozen_string_literal: true

class ParticipantSerializer < ActiveModel::Serializer
  attributes :id, :manager_status, :evaluator_status

  has_one :subject, serializer: UserSerializer
  has_one :evaluator, serializer: UserSerializer
  has_one :relationship, serializer: RelationshipSerializer
end
