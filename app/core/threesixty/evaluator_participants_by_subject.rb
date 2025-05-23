# frozen_string_literal: true

module Threesixty
  class EvaluatorParticipantsBySubject < Rectify::Query
    def initialize(subject_id, campaign_id)
      @subject_id = subject_id
      @campaign_id = campaign_id
    end

    def query
      # TODO: (atanych): should be used statuses
      Threesixty::Participant.
        joins(:evaluator).
        selecting { ['*', 'users.email as evaluator_email'] }.
        active.
        where(subject_id: subject_id, campaign_id: campaign_id).includes(:relationship, :users_result)
    end

    private

    attr_reader :subject_id, :campaign_id
  end
end
