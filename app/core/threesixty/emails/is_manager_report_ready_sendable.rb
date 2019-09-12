# frozen_string_literal: true

module Threesixty
  module Emails
    class IsManagerReportReadySendable < Base
      def call
        return broadcast :ok, false unless inform_manager_about_subject_report_ready?

        subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          [context[:subject].user_id],
          context[:threesixty_campaign]
        )
        broadcast :ok, Threesixty::Reports::ResolveReleaseCondition.call!(
          context[:subject],
          context[:threesixty_campaign].option,
          subject_evaluator_counters.dig(context[:subject].user_id, :completed)
        )
      end

      private

      def inform_manager_about_subject_report_ready?
        option = context[:threesixty_campaign].option.reports
        option.dig('access', 'manager_can_access') &&
          option.dig('availability', 'email_manager_when_report_available') && (
          option.dig('availability', 'report_available_to_context[:subject]_on_criteria') ||
          option.dig('approval', 'administrator_approves_reports')
        )
      end
    end
  end
end
