# frozen_string_literal: true

module Threesixty
  module Participants
    class GetReportStatus < BaseCommand
      INCOMPLETE = 'incomplete'
      DENIED = 'denied'
      AVAILABLE = 'available'
      APPROVED = 'approved'

      def initialize(subject, option)
        @subject = subject
        @option = option
      end

      def call
        return broadcast :ok, nil unless subject
        return broadcast :ok, DENIED if subject.report_denied?
        return broadcast :ok, INCOMPLETE unless Threesixty::Reports::IsAvailable.call!(subject)

        return broadcast :ok, AVAILABLE unless option.participants['requires_approval']
        return broadcast :ok, APPROVED if subject.report_approved?

        broadcast :ok, INCOMPLETE
      end

      private

      attr_reader :subject, :option
    end
  end
end
