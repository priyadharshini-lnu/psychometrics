# frozen_string_literal: true

module Threesixty
  module Emails
    class IsApproveReportSendable < Base
      def call
        return broadcast :ok, false unless inform_manager_about_report_approval?
        return broadcast :ok, false if context[:subject].report_approved?

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

      def inform_manager_about_report_approval?
        option = context[:threesixty_campaign].option.reports
        option.dig('approval', 'manager_approves_reports') &&
          option.dig('approval', 'email_manager_when_report_ready_for_approval')
      end
    end
  end
end
