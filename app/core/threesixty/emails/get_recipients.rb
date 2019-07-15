# frozen_string_literal: true

module Threesixty
  module Emails
    class GetRecipients < BaseCommand
      private_attr_reader :recipient_type, :context

      def initialize(recipient_type, context)
        @recipient_type = recipient_type
        @context = context
      end

      def call
        return broadcast :ok, [context[:subject]] if recipient_type == 'subject'

        recipients = if recipient_type == 'manager'
          Threesixty::Subjects::GetManagers.new(context[:subject]).query.includes(:user)
        elsif recipient_type == 'evaluators_with_pending_evaluations'
          Threesixty::Subjects::GetEvaluatorsWithPendingEvaluations.new(
            context[:threesixty_campaign], context[:subject]
          )
        end

        broadcast :ok, recipients
      end
    end
  end
end
