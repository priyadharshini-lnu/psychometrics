# frozen_string_literal: true

module Threesixty
  module Emails
    class IsManagerReportReadySendable < BaseCommand
      attr_reader :threesixty_campaign, :subject

      def initialize(threesixty_campaign, subject)
        @threesixty_campaign = threesixty_campaign
        @subject = subject
      end

      def call
        return broadcast :ok, false unless inform_manager_about_subject_report_ready?

        subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          [subject.user_id],
          threesixty_campaign
        )
        broadcast :ok, Threesixty::Reports::ResolveReleaseCondition.call!(
          subject,
          threesixty_campaign.option,
          subject_evaluator_counters.dig(subject.user_id, :completed)
        )
      end

      private

      def inform_manager_about_subject_report_ready?
        option = threesixty_campaign.option.reports
        option.dig("access", "manager_can_access") &&
        option.dig("availability", "email_manager_when_report_available") && (
          option.dig("availability", "report_available_to_subject_on_criteria") ||
          option.dig("approval", "administrator_approves_reports")
        )
      end
    end
  end
end
