# frozen_string_literal: true

module Threesixty
  module Emails
    class IsSubjectReportReadySendable < BaseCommand
      attr_reader :threesixty_campaign, :subject

      def initialize(threesixty_campaign, subject)
        @threesixty_campaign = threesixty_campaign
        @subject = subject
      end

      def call
        return broadcast :ok, false unless inform_subject_about_report_ready?
        subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          [subject.user_id],
          threesixty_campaign
        )
        status = Threesixty::Participants::GetReportStatus.call(
          subject,
          threesixty_campaign.option,
          subject_evaluator_counters[subject.user_id]
        )
        broadcast :ok, status == Threesixty::Participants::GetReportStatus::AVAILABLE
      end

      private

      def inform_subject_about_report_ready?
        option = threesixty_campaign.option.reports
        option.dig("access", "self_can_access") &&
        option.dig("availability", "email_subject_when_report_available") && (
          option.dig("availability", "report_available_to_subject_on_criteria") ||
          option.dig("approval", "manager_approves_reports") ||
          option.dig("approval", "administrator_approves_reports")
        )
      end
    end
  end
end