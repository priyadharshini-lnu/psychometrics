# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria
    class ByEvaluations < Base
      COMPLETED = 'completed'
      NOT_COMPLETED = 'not_completed'
      NEEDS_APPROVAl = 'needs_approval'

      private

      def user_matches_criteria?(user)
        criteria_list.any? do |criteria|
          evaluation_state[user.id].include?(criteria['value'])
        end
      end

      def evaluation_state
        @evaluation_state ||= total_evaluation_counts.each_with_object({}) do |(evaluator_id, evaluation), acc|
          return acc[evaluator_id] = [NOT_COMPLETED] if completed_evaluation_counts&.dig(evaluator_id) != evaluation.total_evaluations_count

          return acc[evaluator_id] = [COMPLETED, NEEDS_APPROVAl] if evaluations_need_approval[user.id]

          acc[evaluator_id] = [COMPLETED]
        end
      end

      def evaluations_need_approval
        @evaluations_need_approval ||= threesixty_campaign.
          participants.
          active.
          actual_by_options(option).
          where(evaluator_id: user_ids, manager_evaluation_status: :waiting).
          pluck(:evaluator_id)
      end

      def completed_evaluation_counts
        @completed_evaluations ||= Threesixty::Participants::GetCompletedEvaluations.call!(
          threesixty_campaign,
          user_ids
        )
      end

      def total_evaluation_counts
        @total_evaluations ||= Threesixty::Participants::GetTotalEvaluations.call!(
          threesixty_campaign,
          user_ids
        )
      end
    end
  end
end
