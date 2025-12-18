# frozen_string_literal: true

module Threesixty
  module Reports
    class IsAvailable < BaseCommand
      def initialize(subject, option, subject_evaluator_counters, not_available_details: false)
        @options = option
        @subject = subject
        @subject_evaluator_counters = subject_evaluator_counters
        @not_available_details = not_available_details
      end

      def call
        if @subject.report_approved? || @subject.report_status_released? || !report_available_to_subject_on_criteria?
          return broadcast :ok, true
        end

        result = ResolveReleaseCondition.call!(@subject, @options, @subject_evaluator_counters,
                                               not_available_details: @not_available_details)
        broadcast :ok, result
      end

      private

      def report_available_to_subject_on_criteria?
        @options.reports.dig('availability', 'report_available_to_subject_on_criteria')
      end
    end
  end
end
