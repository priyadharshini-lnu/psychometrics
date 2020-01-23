# frozen_string_literal: true

module Threesixty
  module Campaigns
    class ResetAllNominations < BaseCommand
      def initialize(threesixty_campaign)
        @threesixty_campaign = threesixty_campaign
      end

      def call
        self_relationship_id = Relationship.self_relationship.id
        threesixty_campaign.participants.where.not(relationship_id: self_relationship_id).destroy_all
        threesixty_campaign.campaign.users_results.destroy_all
      end

      private

      attr_reader :threesixty_campaign
    end
  end
end
