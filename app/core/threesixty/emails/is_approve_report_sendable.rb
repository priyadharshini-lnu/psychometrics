# frozen_string_literal: true

module Threesixty
  module Emails
    class IsApproveReportSendable < BaseCommand
      attr_reader :threesixty_campaign, :subject

      def initialize(threesixty_campaign, subject)
        @threesixty_campaign = threesixty_campaign
        @subject = subject
      end

      def call
        return broadcast :ok, false unless inform_manager_about_report_approval?
        return broadcast :ok, false if subject.report_approved?

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

      def inform_manager_about_report_approval?
        option = threesixty_campaign.option.reports
        option.dig("approval", "manager_approves_reports") &&
        option.dig("approval", "email_manager_when_report_ready_for_approval")
      end
    end
  end
end
