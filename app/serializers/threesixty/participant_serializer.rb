# frozen_string_literal: true

module Threesixty
  class ParticipantSerializer < ActiveModel::Serializer
    attributes :id, :manager_nomination_status, :evaluator_nomination_status

    has_one :subject, serializer: UserSerializer
    has_one :evaluator, serializer: UserSerializer
    has_one :relationship, serializer: RelationshipSerializer
  end
end
