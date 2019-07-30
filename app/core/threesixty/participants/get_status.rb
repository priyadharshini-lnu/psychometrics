# frozen_string_literal: true

module Threesixty
  module Participants
    class GetStatus < BaseCommand
      NOT_COMPLETED = 'Not Completed'
      COMPLETED = 'Completed'
      DONE = 'Done'

      def initialize(subject, nomination_requirement, counters = {}, subject_evaluator_counters = {})
        @subject = subject
        @counters = counters
        @nomination_requirement = nomination_requirement
        @subject_evaluator_counters = subject_evaluator_counters
      end

      def call
        if subject&.evaluation_status_completed?
          broadcast :ok, DONE
        elsif valid_nomination_requirement? && all_evaluations_completed?
          broadcast :ok, COMPLETED
        else
          broadcast :ok, NOT_COMPLETED
        end
      end

      def valid_nomination_requirement?
        subject && nomination_requirement && Threesixty::NominationRequirements::IsValid.call!(nomination_requirement, subject_evaluator_counters)
      end

      def all_evaluations_completed?
        counters[:completed_evaluations] >= counters[:total_evaluations]
      end

      private

      attr_reader :subject, :nomination_requirement, :counters, :subject_evaluator_counters
    end
  end
end
