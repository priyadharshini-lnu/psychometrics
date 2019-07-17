# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria
    class Base < BaseCommand
      attr_reader :threesixty_campaign, :participatables, :criteria_list, :participatable_type

      def initialize(options)
        @threesixty_campaign = options[:threesixty_campaign]
        @participatables = options[:participatables]
        @criteria_list = options[:criteria_list]
        @participatable_type = options[:participatable_type]
      end

      def call
        broadcast :ok, participatables.select { |participatable| user_matches_criteria?(participatable.user) }
      end

      private

      def user_ids
        @user_ids ||= participatables.map(&:user_id)
      end
    end
  end
end
