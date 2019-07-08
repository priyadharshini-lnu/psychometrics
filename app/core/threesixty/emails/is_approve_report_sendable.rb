# frozen_string_literal: true

module Threesixty
  module Emails
    class IsApproveReportSendable < BaseCommand
      attr_reader :threesixty_campaign

      def initialize(threesixty_campaign)
        @threesixty_campaign = threesixty_campaign
      end

      def call
        return broadcast :ok, false unless inform_manager_about_report_approval?

        subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          [subject.user_id],
          threesixty_campaign
        )
        broadcast :ok, Threesixty::Reports::ResolveReleaseCondition.call!(
          subject,
          threesixty_campaign.option,
          subject_evaluator_counters[subject.user_id]
        )
      end

      private

      def inform_manager_report_approval?
        option = threesixty_campaign.option.reports
        option.dig("approval", "manager_approves_reports") &&
        option.dig("approval", "email_manager_when_report_ready_for_approval")
      end
    end
  end
end