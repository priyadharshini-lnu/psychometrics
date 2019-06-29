# frozen_string_literal: true

module Threesixty
  module Participants
    class GetStatus < BaseCommand
      NOT_COMPLETED = 'not_completed'
      COMPLETED = 'completed'

      def initialize(evaluator, subject, nomination_requirement, counters = {}, subject_evaluator_counters = {})
        @evaluator = evaluator
        @subject = subject
        @counters = counters
        @nomination_requirement = nomination_requirement
        @subject_evaluator_counters = subject_evaluator_counters
      end

      def call
        if valid_nomination_requirements? && all_evaluations_completed?
          broadcast :ok, COMPLETED
        else
          broadcast :ok, NOT_COMPLETED
        end
      end

      def valid_nomination_requirements?
        subject && nomination_requirement && Threesixty::NominationRequirements::IsValid.call!(nomination_requirement, subject_evaluator_counters)
      end

      def all_evaluations_completed?
        return true unless evaluator

        counters[:completed_evaluations] >= counters[:total_evaluations]
      end

      private

      attr_reader :evaluator, :subject, :nomination_requirement, :counters, :subject_evaluator_counters
    end
  end
end
