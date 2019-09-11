# frozen_string_literal: true

module Threesixty
  module ParticipatorByCriteria
    class ByEvaluations < Base
      COMPLETED = 'completed'
      NOT_COMPLETED = 'not_completed'
      NEEDS_APPROVAL = 'needs_approval'

      private

      def user_matches_criteria?(user, criteria)
        total = total_evaluation_counts(criteria['exclude_self_evaluations'])[user.id]
        completed = completed_evaluation_counts(criteria['exclude_self_evaluations'])[user.id]

        return criteria['value'] == COMPLETED unless total
        if !completed || total.total_evaluations_count != completed.completed_evaluations_count
          return criteria['value'] == NOT_COMPLETED
        end
        return true if evaluations_need_approval.include?(user.id) && criteria['value'] == NEEDS_APPROVAL

        criteria['value'] == COMPLETED
      end

      def evaluations_need_approval
        @evaluations_need_approval ||= threesixty_campaign.
                                       participants.
                                       active.
                                       actual_by_options(threesixty_campaign.option).
                                       where(evaluator_id: user_ids, manager_evaluation_status: :waiting).
                                       pluck(:evaluator_id).
                                       to_set
      end

      def completed_evaluation_counts(exclude_self_evaluations)
        @completed_evaluation_counts ||= Threesixty::Participants::GetCompletedEvaluations.call!(
          threesixty_campaign,
          user_ids,
          exclude_self_evaluations: exclude_self_evaluations
        )
      end

      def total_evaluation_counts(exclude_self_evaluations)
        @total_evaluation_counts ||= Threesixty::Participants::GetTotalEvaluations.call!(
          threesixty_campaign,
          user_ids,
          exclude_self_evaluations: exclude_self_evaluations
        )
      end
    end
  end
end
