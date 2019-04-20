# frozen_string_literal: true

module Threesixty
  module Participants
    class GetReportStatus < BaseCommand
      def initialize(subject, option)
        @subject = subject
        @option = option
      end

      def call
        return broadcast :ok, 'denied' if subject.report_denied?
        return broadcast :ok, 'incomplete' unless Threesixty::Reports::IsAvailable.call!(subject)

        return broadcast :ok, 'available' unless option.participants['requires_approval']
        return broadcast :ok, 'approved' if subject.report_approved?

        broadcast :ok, 'incomplete'
      end

      private

      attr_reader :subject, :option
    end
  end
end
