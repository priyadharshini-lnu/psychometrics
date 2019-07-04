# frozen_string_literal: true

module Threesixty
  module Emails
    class IsDeniedNominationSendable < Basecommand
      attr_reader :threesixty_campaign

      def initailize(threesixty_campaign)
        @threesixty_campaign = threesixty_campaign
      end

      def call
        boradcast :ok, inform_subject_when_nomination_is_denied?
      end

      private

      def inform_subject_when_nomination_is_denied?
        option = threesixty_campaign.option.participants
        option.dig(:subject ,:can_nominate_evaluators) &&
        option.dig(:manager, :can_approve_nominations) &&
        option.dig(:manager, :email_subject_when_manager_declines_nomination)
      end
    end
  end
end