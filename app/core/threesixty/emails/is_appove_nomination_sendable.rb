# frozen_string_literal: true

module Threesixty
  module Emails
    class IsAppoveNominationSendable < BaseCommand
      attr_reader :threesixty_campaign

      def initialize(threesixty_campaign)
        @threesixty_campaign = threesixty_campaign
      end

      def call
        broadcast :ok, inform_manager_about_nomination?
      end

      private

      def inform_manager_about_nomination?
        option = threesixty_campaign.option.participants
        option.dig("subject" ,"can_nominate_evaluators") &&
        option.dig("manager", "can_approve_nominations") &&
        option.dig("manager", "email_managers_on_nomination_approval")
      end
    end
  end
end