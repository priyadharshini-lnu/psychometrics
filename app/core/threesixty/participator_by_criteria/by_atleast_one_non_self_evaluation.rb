# frozen_string_literal: true

module Threesixty
  module ParticipatorByCriteria
    class ByAtleastOneNonSelfEvaluation < Base
      def user_matches_criteria?(user, _)
        evaluation_count = evaluations_count[user.id]
        evaluation_count&.count&.positive?
      end

      private

      def evaluations_count
        return @evaluators_with_subject_ids if @evaluators_with_subject_ids

        participants = threesixty_campaign.
                       participants.
                       where(evaluator_id: user_ids).
                       where('subject_id != evaluator_id').
                       where(evaluator_nomination_status: :waiting).
                       where.not(subject_id: evaluation_complted_subject_ids).
                       group(:evaluator_id).
                       select('evaluator_id, count(id) as count')

        if threesixty_campaign.option.participants.dig('manager', 'can_approve_nominations')
          participants = participants.where(manager_nomination_status: :approved)
        end

        participants.index_by(&:evaluator_id)
      end

      def evaluation_complted_subject_ids
        threesixty_campaign.subjects.evaluation_status_completed.pluck(:user_id)
      end
    end
  end
end
