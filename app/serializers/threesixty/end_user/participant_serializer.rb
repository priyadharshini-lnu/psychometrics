# frozen_string_literal: true

module Threesixty::EndUser
  class ParticipantSerializer < Panko::Serializer
    attributes :evaluator_nomination_status, :manager_evaluation_status
  end
end
