# frozen_string_literal: true

module Threesixty
  module Participants
    class GetApprovalStatus < BaseCommand
      WAITING = 'need_approval'
      APPROVED = 'approved'
      DENIED = 'denied'

      def initialize(evaluator, subject, option, nomination_requirement)
        @evaluator = evaluator
        @subject = subject
        @option = option || Threesixty::Option.new
        @nomination_requirement = nomination_requirement
      end

      def call
        return broadcast :ok, WAITING

        return broadcast :ok, APPROVED
        return broadcast :ok, DENIED

        broadcast :ok, WAITING
      end

      private

      attr_reader :evaluator, :subject, :option, :nomination_requirement
    end
  end
end
