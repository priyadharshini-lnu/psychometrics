# frozen_string_literal: true

module Threesixty
  module Campaigns
    class ResetAllNominations < BaseCommand
      def initialize(threesixty_campaign)
        @threesixty_campaign = threesixty_campaign
      end

      def call
        threesixty_campaign.participants.find_each do |participant|
          participant.threesixty_subject.decrement!(:evaluators_count)
          participant.threesixty_evaluator.decrement!(:evaluations_count)
          participant.destroy!
        end
      end

      private

      attr_reader :threesixty_campaign
    end
  end
end
