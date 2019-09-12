# frozen_string_literal: true

module Threesixty
  module Emails
    class IsRequestApprovalSendable < Base
      def call
        broadcast :ok, can_request_approval_from_manager?
      end

      private

      def can_request_approval_from_manager?
        option = context[:threesixty_campaign].option.participants
        option.dig('subject', 'can_nominate_evaluators') &&
          option.dig('manager', 'can_approve_nominations') &&
          option.dig('manager', 'subjects_can_email_managers')
      end
    end
  end
end
