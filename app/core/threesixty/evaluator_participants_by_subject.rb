# frozen_string_literal: true

module Threesixty
  class EvaluatorParticipantsBySubject < Rectify::Query
    def initialize(subject)
      @subject = subject
    end

    def query
      # TODO: (atanych): should be used statuses
      Threesixty::Participant.
        joins(:evaluator).
        selecting { ['*', 'users.email as evaluator_email'] }.
        active.
        where(subject_id: subject.user_id).
        includes(:relationship)
    end

    private

    attr_reader :subject
  end
end
