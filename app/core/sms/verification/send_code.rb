# frozen_string_literal: true

module Sms
  module Verification
    class SendCode < BaseCommand
      private_attr_reader :to_mobile_no

      def initialize(to_mobile_no)
        @to_mobile_no = to_mobile_no
      end

      def call
        verification = client.
                       verify.
                       v2.
                       services(verification_service_sid).
                       verifications.
                       create(locale: I18n.locale, to: to_mobile_no, channel: 'sms')

        broadcast :ok, build_verification_response(verification.status, nil)
      rescue Twilio::REST::RestError => e
        handle_errors(e.code)
      end

      private

      def client
        @client ||= Sms::TwilioClient.get
      end

      def verification_service_sid
        Rails.application.secrets.twilio[:verification_service_sid]
      end

      def handle_errors(status_code)
        case status_code
          when 20_429
            broadcast :error,
                      build_verification_response('error',
                                                  I18n.t('auth.verify_mobile_number.error.max_attempts_reached'))
          when 60_410
            broadcast :error, build_verification_response('error', I18n.t('auth.verify_mobile_number.error.blocked'))
          else
            broadcast :error, build_verification_response('error', I18n.t('common.errors.something_wrong'))
        end
      end

      def build_verification_response(status, error_message)
        VerificationResponse.new(
          error_message: error_message,
          status: status,
          to_mobile_no: to_mobile_no,
          verification_code: nil
        )
      end
    end
  end
end
