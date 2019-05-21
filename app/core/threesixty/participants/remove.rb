# frozen_string_literal: true

module Threesixty
  module Participants
    class Remove < BaseCommand
      def initialize(participants, campaign)
        @participants = Array.wrap(participants)
        @campaign = campaign
      end

      def call
        participants.each do |participant|
          evaluator = ::Threesixty::Evaluator.find_by!(user_id: participant.evaluator_id, campaign: campaign)
          subject = ::Threesixty::Subject.find_by!(user_id: participant.subject_id, campaign: campaign)
          evaluator.decrement!(:evaluations_count)
          subject.decrement!(:evaluators_count)
          participant.destroy!
        end
      end

      private

      attr_reader :participants, :campaign
    end
  end
end
