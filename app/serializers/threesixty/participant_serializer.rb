# frozen_string_literal: true

module Threesixty
  class ParticipantSerializer < Panko::Serializer
    attributes :id, :manager_nomination_status, :evaluation_status, :manager_evaluation_status, :result

    has_one :subject, serializer: UserSerializer
    has_one :evaluator, serializer: UserSerializer
    has_one :relationship, serializer: RelationshipSerializer

    def evaluation_status
      return :completed if result&.completed?

      return :declined if object.evaluator_nomination_declined?

      :waiting
    end

    def result
      return unless object.users_result

      Threesixty::ResultSerializer.new.serialize(object.users_result)
    end
  end
end
