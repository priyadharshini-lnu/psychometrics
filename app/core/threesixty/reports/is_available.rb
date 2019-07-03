# frozen_string_literal: true

module Threesixty
  module Reports
    class IsAvailable < BaseCommand
      def initialize(campaign, subject)
        @campaign = campaign
        @options = @campaign.option
        @subject = subject
      end

      def call
        if @subject.report_approved? || @subject.report_status_released? || !report_available_to_subject_on_criteria?
          return broadcast :ok, true
        end
        broadcast :ok, ResolveReleaseCondition.call!(@campaign, @subject)
      end

      private

      def report_available_to_subject_on_criteria?
        @options.reports.dig('availability', 'report_available_to_subject_on_criteria')
      end

      def approved_by_admin?

      end
    end
  end
end
