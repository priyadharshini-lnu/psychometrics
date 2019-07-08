# frozen_string_literal: true

#
# Set to 'On hold' when Admin marks report as on hold from Subject listing page
# Set to 'Approved' when 'Manager approves reports' is set and Manager have approved report for Subject
# Set to Available when following conditions are meet
#
#
# If 'Manager approves reports' is not set and Report availability conditions are meet
# Or if Admin approves the report (even if report availability conditions are not meet)
# Or if Admin Releases the report (even if report availability conditions are not meet)
#

module Threesixty
  module Participants
    class GetReportStatus < BaseCommand
      INCOMPLETE = 'incomplete'
      DENIED = 'denied'
      AVAILABLE = 'available'
      APPROVED = 'approved'
      ON_HOLD = 'on_hold'
      NOT_AVAILABLE = 'not_available'

      def initialize(subject, option, subject_evaluator_counters)
        @subject = subject
        @option = option
        @subject_evaluator_counters = subject_evaluator_counters
      end

      def call
        return broadcast :ok, nil unless subject
        return broadcast :ok, NOT_AVAILABLE unless subject_cannot_access_report?
        return broadcast :ok, ON_HOLD if subject.report_status_on_hold?
        return broadcast :ok, APPROVED if manager_can_approve_evaluations? && subject.report_approved?

        return broadcast :ok, AVAILABLE if Threesixty::Reports::IsAvailable.call!(subject, option, subject_evaluator_counters) && !manager_can_approve_evaluations?
        return broadcast :ok, AVAILABLE if subject.report_approved?
        return broadcast :ok, AVAILABLE if subject.report_status_released?

        broadcast :ok, INCOMPLETE
      end

      private

      attr_reader :subject, :option, :subject_evaluator_counters

      def manager_can_approve_evaluations?
        !!option.participants.dig('manager', 'can_approves_evaluations')
      end

      def subject_cannot_access_report?
        option.reports.dig('access', 'self_can_access')
      end
    end
  end
end
