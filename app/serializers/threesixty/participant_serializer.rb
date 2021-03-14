# frozen_string_literal: true

module Threesixty
  class ParticipantSerializer < ActiveModel::Serializer
    attributes :id, :manager_nomination_status, :evaluation_status, :manager_evaluation_status

    has_one :subject, serializer: UserSerializer
    has_one :evaluator, serializer: UserSerializer
    has_one :relationship, serializer: RelationshipSerializer
    has_one :result, serializer: ResultSerializer

    def evaluation_status
      return :completed if result&.completed?

      return :declined if object.evaluator_nomination_declined?

      :waiting
    end

    private

    def result
      object.users_result
    end
  end
end
