# frozen_string_literal: true

module Threesixty
  module Campaigns
    class ResetAllNominations < BaseCommand
      def initialize(threesixty_campaign)
        @threesixty_campaign = threesixty_campaign
      end

      def call
        threesixty_campaign.participants.joins(:relationship).merge(Relationship.not_self).destroy_all
        threesixty_campaign.campaign.users_results.destroy_all
      end

      private

      attr_reader :threesixty_campaign
    end
  end
end
