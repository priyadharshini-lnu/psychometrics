# frozen_string_literal: true

module Threesixty
  class CampaignDetailsSerializer < Panko::Serializer
    attributes :options, :evaluators

    def evaluators
      participants = Threesixty::EvaluatorParticipantsBySubject.new(user_id, object.campaign_id).query

      participants.map do |participant|
        {
          relationship: participant.relationship.name,
          manager_evaluation_status: participant.manager_evaluation_status,
          status: participant.users_result&.status
        }
      end
    end

    def user_id
      context[:user_report].user_id
    end

    def options
      {
        can_approves_evaluations: !!object.option.participants.dig('manager', 'can_approves_evaluations')
      }
    end
  end
end
