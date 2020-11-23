# frozen_string_literal: true

module Threesixty
  class CampaignDetailsSerializer < ActiveModel::Serializer
    attributes :options, :evaluators

    def evaluators
      participants = Threesixty::EvaluatorParticipantsBySubject.new(user_id, object.campaign_id).query

      users_results = UsersResult.
                      select(:evaluator_id, :status).
                      where(
                        campaign_id: object.campaign_id,
                        evaluator_id: participants.map(&:evaluator_id),
                        subject_id: user_id
                      ).
                      index_by(&:evaluator_id)

      participants.map do |participant|
        {
          relationship: participant.relationship.name,
          manager_evaluation_status: participant.manager_evaluation_status,
          status: users_results[participant.evaluator_id]&.status
        }
      end
    end

    def user_id
      instance_options[:user_report].user_id
    end

    def options
      {
        can_approves_evaluations: !!object.option.participants.dig('manager', 'can_approves_evaluations')
      }
    end
  end
end
