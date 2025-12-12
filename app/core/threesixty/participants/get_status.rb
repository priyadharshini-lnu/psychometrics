# frozen_string_literal: true

module Threesixty
  module Participants
    class GetStatus < BaseCommand
      NOT_COMPLETED = 'not_completed'
      COMPLETED = 'completed'
      DONE = 'done'
      NOTHING_ASSIGNED = 'nothing_assigned'

      def initialize(subject, nomination_requirement, counters = {}, subject_evaluator_counters = {})
        @subject = subject
        @counters = counters
        @nomination_requirement = nomination_requirement
        @subject_evaluator_counters = subject_evaluator_counters
      end

      def call
        unless subject
          return broadcast(:ok, NOTHING_ASSIGNED) if no_evaluations_assigned?
          return broadcast(:ok, COMPLETED) if all_evaluations_completed?

          return broadcast(:ok, NOT_COMPLETED)
        end

        if subject&.evaluation_status_completed?
          broadcast :ok, DONE
        elsif no_evaluations_assigned?
          broadcast :ok, NOTHING_ASSIGNED
        elsif valid_nomination_requirement? && all_evaluations_completed?
          broadcast :ok, COMPLETED
        else
          broadcast :ok, NOT_COMPLETED
        end
      end

      def valid_nomination_requirement?
        return true if nomination_requirement.nil?

        subject &&
          Threesixty::NominationRequirements::IsValid.call!(nomination_requirement, subject_evaluator_counters)
      end

      def no_evaluations_assigned?
        counters[:total_evaluators].to_i.zero?
      end

      def all_evaluations_completed?
        counters[:total_evaluators].positive? && counters[:completed_evaluators] >= counters[:total_evaluators]
      end

      private

      attr_reader :subject, :nomination_requirement, :counters, :subject_evaluator_counters
    end
  end
end
