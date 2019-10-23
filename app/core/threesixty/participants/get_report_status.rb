# frozen_string_literal: true

#
# Set to 'On hold' when Admin marks report as on hold from Subject listing page
# Set to 'Approved' when 'Manager approves reports' is set and Manager have approved report for Subject
#
# Set to Available when following conditions are meet
# If 'Manager approves reports' is not set and Report availability conditions are meet
# Or if Admin approves the report (even if report availability conditions are not meet)

# Set to 'released' if Admin Releases the report
module Threesixty
  module Participants
    class GetReportStatus < BaseCommand
      INCOMPLETE = 'incomplete'
      DENIED = 'denied'
      AVAILABLE = 'available'
      APPROVED = 'approved'
      ON_HOLD = 'on_hold'
      NOT_AVAILABLE = 'not_available'
      RELEASED = 'released'

      def initialize(subject, option, subject_evaluator_counters)
        @subject = subject
        @option = option
        @subject_evaluator_counters = subject_evaluator_counters
      end

      def call
        return broadcast :ok, nil unless subject
        return broadcast :ok, NOT_AVAILABLE unless subject_cannot_access_report?
        return broadcast :ok, RELEASED if subject.report_status_released?
        return broadcast :ok, ON_HOLD if subject.report_status_on_hold?
        return broadcast :ok, APPROVED if manager_can_approve_report? && subject.report_approved?

        if Threesixty::Reports::IsAvailable.call!(subject, option, subject_evaluator_counters) &&
           !report_approval_required?
          return broadcast :ok, AVAILABLE
        end
        return broadcast :ok, AVAILABLE if subject.report_approved?

        broadcast :ok, INCOMPLETE
      end

      private

      attr_reader :subject, :option, :subject_evaluator_counters

      def subject_cannot_access_report?
        option.reports.dig('access', 'self_can_access')
      end

      def report_approval_required?
        manager_can_approve_report? || admin_approves_report?
      end

      def manager_can_approve_report?
        option.reports.dig('approval', 'manager_approves_reports')
      end

      def admin_approves_report?
        option.reports.dig('approval', 'administrator_approves_reports')
      end
    end
  end
end
