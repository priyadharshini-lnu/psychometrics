# frozen_string_literal: true

module Threesixty::EndUser
  class ParticipantSerializer < ActiveModel::Serializer
    attributes :evaluator_nomination_status, :manager_evaluation_status
  end
end
