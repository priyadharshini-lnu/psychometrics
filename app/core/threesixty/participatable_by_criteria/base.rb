# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria < BaseCommand
    class Base
      attr_reader :threesixty_campaign, :participatables, :criteria_list

      def initialize(threesixty_campaign, participatables, criteria_list)
        @threesixty_campaign =threesixty_campaign
        @participatables = participatables
        @criteria_list = criteria_list
      end

      def call
        participatables.select do |participatable|
          user_matches_criteria?(participatable.user)
        end
      end
    end
  end
end
