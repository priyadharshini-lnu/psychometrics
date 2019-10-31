# frozen_string_literal: true

module Threesixty
  module Emails
    class IsSubjectReportReadySendable < Base
      def call
        return broadcast :ok, false unless inform_subject_about_report_ready?

        subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          [context[:subject].user_id],
          context[:threesixty_campaign]
        )

        is_report_available = Threesixty::Subjects::IsReportAvailable.call!(
          context[:subject],
          context[:threesixty_campaign].option,
          subject_evaluator_counters.dig(context[:subject].user_id, :completed)
        )

        broadcast :ok, is_report_available
      end

      private

      def inform_subject_about_report_ready?
        option = context[:threesixty_campaign].option.reports
        option.dig('access', 'self_can_access') &&
          option.dig('availability', 'email_subject_when_report_available') && (
          option.dig('availability', 'report_available_to_subject_on_criteria') ||
          option.dig('approval', 'manager_approves_reports') ||
          option.dig('approval', 'administrator_approves_reports')
        )
      end
    end
  end
end
