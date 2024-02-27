# frozen_string_literal: true

module Threesixty
  class ParticipantSerializer < ActiveModel::Serializer
    attributes :id, :manager_nomination_status, :evaluation_status, :manager_evaluation_status, :subject, :evaluator

    has_one :relationship, serializer: RelationshipSerializer
    has_one :result, serializer: Threesixty::ResultSerializer

    def subject
      UserSerializer.new.serialize(object.subject)
    end

    def evaluator
      UserSerializer.new.serialize(object.evaluator)
    end

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
