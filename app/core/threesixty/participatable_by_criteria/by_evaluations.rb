# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria
    class ByEvaluations < Base
      COMPLETED = 'completed'
      NOT_COMPLETED = 'not_completed'
      NEEDS_APPROVAl = 'needs_approval'

      private

      def user_matches_criteria?(user, criteria)
        evaluation_state[user.id]&.include?(criteria['value'])
      end

      def evaluation_state
        @evaluation_state ||= total_evaluation_counts.each_with_object({}) do |(evaluator_id, evaluation), acc|
          if completed_evaluation_counts&.dig(evaluator_id)&.completed_evaluations_count != evaluation.total_evaluations_count
            acc[evaluator_id] = [NOT_COMPLETED]
          elsif evaluations_need_approval.include?(evaluator_id)
            acc[evaluator_id] = [COMPLETED, NEEDS_APPROVAl]
          else
            acc[evaluator_id] = [COMPLETED]
          end
        end
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

      def completed_evaluation_counts
        @completed_evaluations ||= Threesixty::Participants::GetCompletedEvaluations.call!(
          threesixty_campaign,
          user_ids
        )
      end

      def total_evaluation_counts
        @total_evaluation_counts ||= Threesixty::Participants::GetTotalEvaluations.call!(
          threesixty_campaign,
          user_ids
        )
      end
    end
  end
end
