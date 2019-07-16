# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria
    class ByManagerTasks < Base
      private

      def user_matches_criteria?(user)
        criteria_list.all? do |criteria|
          Threesixty::Participants::GetStatus.call!(user.id)
        end
      end

      def subject_evaluator_counters
        @subject_evaluator_counters ||= subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          user_ids,
          threesixty_campaign
        )
      end

      def nomination_requirement_by_user_id
        @nomination_requirement_by_user_id ||= ::Threesixty::NominationRequirements::FindForUsers.call!(
          evaluators.map(&:user),
          threesixty_campaign
        )
      end

      def evaluations_received
        @evaluations_received ||= Threesixty::Subjects::GetEvaluationsReceived.call!(threesixty_campaign, user_ids)
      end
    end
  end
end
