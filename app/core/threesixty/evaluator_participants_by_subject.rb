module Threesixty
  class EvaluatorParticipantsBySubject < Rectify::Query
    def initialize(subject)
      @subject = subject
    end

    def query
      # TODO (atanych): should be used statuses
      Participant.where(subject_id: subject.campaigns_user_id).includes(:relationship)
    end

    private

    attr_reader :subject
  end
end
