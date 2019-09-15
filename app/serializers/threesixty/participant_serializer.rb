# frozen_string_literal: true

module Threesixty
  class ParticipantSerializer < ActiveModel::Serializer
    attributes :id, :manager_nomination_status, :evaluation_status, :manager_evaluation_status

    has_one :subject, serializer: UserSerializer
    has_one :evaluator, serializer: UserSerializer
    has_one :relationship, serializer: RelationshipSerializer
    has_one :result, serializer: ResultSerializer, if: -> { result && result.completed? }

    def evaluation_status
      return :completed if result&.completed?

      return :declined if object.evaluator_nomination_declined?

      :waiting
    end

    private

    def result
      (@instance_options[:user_result_map] || {})[[object.evaluator_id, object.subject_id]]
    end
  end
end
