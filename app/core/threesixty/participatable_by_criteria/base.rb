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
        filtered_participatables = participatables.select do |participatable|
          criteria_list.any? do |criteria|
            user_matches_criteria?(participatable.user, criteria)
          end
        end

        broadcast :ok, filtered_participatables
      end

      private

      def users
        @users ||= participatables.map(&:user)
      end

      def user_ids
        @user_ids ||= users.map(&:id)
      end
    end
  end
end
