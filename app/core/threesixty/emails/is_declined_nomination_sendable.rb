# frozen_string_literal: true

module Threesixty
  module Emails
    class IsDeclinedNominationSendable < Base
      def call
        broadcast :ok, inform_subject_when_nomination_is_declined?
      end

      private

      def inform_subject_when_nomination_is_declined?
        option = context[:threesixty_campaign].option.participants
        option.dig('evaluator', 'can_decline_nomination') &&
          option.dig('evaluator', 'email_subject_when_evaluators_declines_nomination')
      end
    end
  end
end
