# frozen_string_literal: true

module Threesixty
  module Subjects
    class GetReportStatusMessage < BaseCommand
      private_attr_reader :subject, :status, :option, :subject_evaluator_counters

      def initialize(subject, status, option, subject_evaluator_counters)
        @status = status
        @subject = subject
        @option = option
        @subject_evaluator_counters = subject_evaluator_counters
      end

      def call
        status_message = generate_message_for_status(status)

        broadcast :ok, { status: status, status_message: status_message }
      end

      private

      def generate_message_for_status(status)
        return nil if available_statuses.include?(status)

        user_email = subject.user&.email || 'Unknown User'

        case status
          when Threesixty::Participants::GetReportStatus::ON_HOLD
            I18n.t('admin.report_on_hold', user: user_email)
          when Threesixty::Participants::GetReportStatus::DENIED
            I18n.t('admin.report_denied', user: user_email)
          when Threesixty::Participants::GetReportStatus::INCOMPLETE
            determine_incomplete_reason(user_email)
          when Threesixty::Participants::GetReportStatus::NOT_AVAILABLE
            I18n.t('admin.report_not_generated', user: user_email)
        end
      end

      def determine_incomplete_reason(user_email)
        if manager_can_approve_report? && !subject.report_approved?
          I18n.t('admin.manager_approval_required', user: user_email)
        elsif admin_approves_report? && !subject.report_approved?
          I18n.t('admin.admin_approval_required', user: user_email)
        else
          result = Threesixty::Reports::ResolveReleaseCondition.call!(
            subject, option, subject_evaluator_counters, not_available_details: true
          )

          if result.is_a?(Hash) && result[:failed_conditions].present?
            condition_messages = result[:failed_conditions].map do |condition|
              I18n.t('admin.report_condition_not_met',
                     relationship: condition[:relationship],
                     required: condition[:required],
                     actual: condition[:actual])
            end

            I18n.t('admin.report_conditions_not_met_detailed',
                   user: user_email,
                   conditions: condition_messages.join('. '))
          end
        end
      end

      def available_statuses
        [
          Threesixty::Participants::GetReportStatus::APPROVED,
          Threesixty::Participants::GetReportStatus::AVAILABLE,
          Threesixty::Participants::GetReportStatus::RELEASED
        ]
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
