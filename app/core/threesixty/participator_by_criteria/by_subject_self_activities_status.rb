# frozen_string_literal: true

module Threesixty
  module ParticipatorByCriteria
    class BySubjectSelfActivitiesStatus < Base
      def call
        results = participators.select do |subject|
          criteria_list.any? do |criteria|
            get_status(subject) == criteria['value']
          end
        end

        broadcast :ok, results
      end

      private

      def get_status(subject)
        return 'done' if subject.evaluation_status_completed?

        if valid_nomination_requirement?(subject) && all_evaluations_completed_by_subject?(subject)
          return 'completed'
        end

        'not_completed'
      end

      def all_evaluations_completed_by_subject?(subject)
        counter = counters[subject.user_id]
        counter[:completed_evaluations] >= counter[:total_evaluations]
      end

      def valid_nomination_requirement?(subject)
        nomination_requirement = nomination_requirement_by_user_id[subject.user_id]
        subject_counters = subject_evaluator_counters.dig(subject.user_id, :all)

        return true if nomination_requirement.nil?

        Threesixty::NominationRequirements::IsValid.call!(nomination_requirement, subject_counters)
      end

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
