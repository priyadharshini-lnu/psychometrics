# frozen_string_literal: true

module Threesixty
  module Subjects
    class IsReportAvailable < BaseCommand
      private_attr_reader :subject, :option, :subject_evaluator_counters

      REPORT_AVAILABLE_STATUSES = [
        Threesixty::Participants::GetReportStatus::APPROVED,
        Threesixty::Participants::GetReportStatus::AVAILABLE,
        Threesixty::Participants::GetReportStatus::RELEASED
      ].freeze

      def initialize(subject, option, subject_evaluator_counters)
        @subject = subject
        @option = option
        @subject_evaluator_counters = subject_evaluator_counters
      end

      def call
        status = Threesixty::Participants::GetReportStatus.call!(
          subject,
          option,
          subject_evaluator_counters
        )

        if REPORT_AVAILABLE_STATUSES.include?(status) || subject.evaluation_status_completed?
          broadcast :ok, { available: true, status_message: nil }
        else
          message_result = Threesixty::Subjects::GetReportStatusMessage.call!(
            subject,
            status,
            option,
            subject_evaluator_counters
          )

          broadcast :ok, {
            available: false,
            status_message: message_result[:status_message]
          }
        end
      end
    end
  end
end
