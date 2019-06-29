# frozen_string_literal: true

module Threesixty
  module Reports
    # TODO (atanych): should be added:
    # subject.report_approved? || subject.report_status_released?
    class IsAvailable < BaseCommand
      def initialize(subject, option, subject_evaluator_counters)
        @subject = subject
        @option = option
        @subject_evaluator_counters = subject_evaluator_counters
      end

      def call; end
    end
  end
end
