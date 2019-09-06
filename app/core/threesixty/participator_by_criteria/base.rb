# frozen_string_literal: true

module Threesixty
  module ParticipatorByCriteria
    class Base < BaseCommand
      private_attr_reader :threesixty_campaign, :participators, :criteria_list, :participator_type, :email_name

      def initialize(options)
        @threesixty_campaign = options[:threesixty_campaign]
        @participators = options[:participators]
        @criteria_list = options[:criteria_list]
        @participator_type = options[:participator_type]
        @email_name = options[:email_name]
      end

      def call
        filtered_participators = participators.select do |participator|
          criteria_list.any? do |criteria|
            user_matches_criteria?(participator.user, criteria)
          end
        end

        broadcast :ok, filtered_participators
      end

      private

      def user_matches_criteria?
        raise 'should be implemented user_matches_criteria?'
      end

      def users
        @users ||= participators.map(&:user)
      end

      def user_ids
        @user_ids ||= users.map(&:id)
      end
    end
  end
end
