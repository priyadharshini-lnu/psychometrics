module Threesixty
  class NominationsByUser < Rectify::Query
    def initialize(subject)
      @subject = subject
    end

    def query
      Participant.
        where(subject_id: subject.id).
        includes(:relationship)
    end

    private

    attr_reader :subject
  end
end
