# frozen_string_literal: true

module Threesixty
  module ParticipatorByCriteria
    class ByHavingApartFromSelfEvaluation < Base
      def user_matches_criteria?(user, _)
        unless evaluation_count = evaluations_count[user.id] && evaluation_count.count > 0
          return broadcast :ok, false
        end

        broadcast :ok, results
      end

      private

      def evaluations_count
        return @evaluators_with_subject_ids if @evaluators_with_subject_ids

        participants = ::Threesixty::Participant.
          where(evaluator_id: user_ids).
          where("subject_id != evaluator_id").
          group(:evaluator_id).
          select("evaluator_id, count(id) as count")

        if threesixty_campaign.option.participants.dig('manager', 'can_approve_nominations')
          participants = participants.where(manager_nomination_status: :approved)
        end

        participants.index_by(&:evaluator_id)
      end
    end
  end
end
