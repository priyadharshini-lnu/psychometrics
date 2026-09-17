# frozen_string_literal: true

module Communications
  module Emails
    class Retrigger < BaseCommand
      def initialize(communication_email)
        @communication_email = communication_email
      end

      def call
        return broadcast(:invalid_status, communication_email) unless communication_email.failed?

        communication_email.update!(error_code: nil, error_message: nil)
        communication_email.redeliver!
        broadcast(:ok, communication_email)
      end

      private

      attr_reader :communication_email
    end
  end
end
