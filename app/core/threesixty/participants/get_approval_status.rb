# frozen_string_literal: true

module Threesixty
  module Participants
    class GetApprovalStatus < BaseCommand
      def initialize(evaluator, subject)
        @campaign = evaluator.campaign
        @evaluator = evaluator
        @subject = subject
      end

      def call
        participant = @campaign.participants.find_by(evaluator_id: @evaluator.user_id, subject_id: @subject.user_id)
        return broadcast :ok, participant.manager_status if participant
        return broadcast :ok, :waiting
      end

      private

      attr_reader :evaluator, :subject, :option, :nomination_requirement
    end
  end
end
