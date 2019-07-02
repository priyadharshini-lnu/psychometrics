# frozen_string_literal: true

module Threesixty
  module Campaigns
    class Reset < BaseCommand
      ASSOCIATIONS_TO_REMOVE = %i(
        nomination_requirements
        participants
        campaigns_users
        subjects
        evaluators
      )

      def initialize(threesixty_campaign)
        @threesixty_campaign = threesixty_campaign
      end

      def call
        ASSOCIATIONS_TO_REMOVE.each { |association| threesixty_campaign.public_send(association).find_each(&:destroy!) }
      end

      private

      attr_reader :threesixty_campaign
    end
  end
end
