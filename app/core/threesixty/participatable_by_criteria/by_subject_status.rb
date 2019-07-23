# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria
    class BySubjectStatus < Base
      def call
        results = participatables.select do |subject|
          criteria_list.any? do |criteria|
            status = Threesixty::Participants::GetStatus.call!(
              subject,
              nomination_requirement_by_user_id[subject.user_id],
              counters,
              subject_evaluator_counters.dig(subject.user_id, :all)
            )
            status == criteria['value']
          end
        end

        broadcast :ok, results
      end

      private

      def counters
        @counters ||= ::Threesixty::Participants::CalcCounters.call!(user_ids, threesixty_campaign)
      end

      def subject_evaluator_counters
        @subject_evaluator_counters ||= ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          user_ids,
          threesixty_campaign
        )
      end

      def nomination_requirement_by_user_id
        @nomination_requirement_by_user_id ||= ::Threesixty::NominationRequirements::FindForUsers.call!(
          users,
          threesixty_campaign
        )
      end
    end
  end
end
