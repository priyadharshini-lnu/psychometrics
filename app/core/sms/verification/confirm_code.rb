# frozen_string_literal: true

module Sms
  module Verification
    class ConfirmCodePendingError < ::AsyncResponseRequest::AsyncRequestError; end

    class ConfirmCode < AsyncResponseRequest::AsyncRequestHandler
      private_attr_reader :to_mobile_no, :verification_code

      def call
        @to_mobile_no = params[:mobile_number]
        @verification_code = params[:verification_code]

        verification_check = client.
                             verify.
                             v2.
                             services(verification_service_sid).
                             verification_checks.
                             create(to: to_mobile_no, code: verification_code)

        handle_verification_status(verification_check.status)
      rescue Twilio::REST::RestError
        verification_response = build_verification_response(
          'error', I18n.t('auth.verify_mobile_number.error.invalid_code')
        )

        async_response.response_data = verification_response
        broadcast(:invalid, async_response)
      end

      private

      def client
        @client ||= Sms::TwilioClient.get
      end

      def verification_service_sid
        Rails.application.secrets.twilio[:verification_service_sid]
      end

      def handle_verification_status(status)
        case status
          when 'approved'
            verification_response = build_verification_response(status)

            async_response.response_data = serialized_result(verification_response)
            broadcast(:ok, async_response)
          when 'max_attempts_reached'
            verification_response = build_verification_response(
              'error', I18n.t('auth.verify_mobile_number.error.max_attempts_reached')
            )

            async_response.response_data = verification_response
            broadcast(:invalid, async_response)
          else
            verification_response = build_verification_response(
              'error', I18n.t('auth.verify_mobile_number.error.invalid_code')
            )

            async_response.response_data = verification_response
            broadcast(:invalid, async_response)
        end
      end

      def build_verification_response(status, error_message = nil)
        Sms::Verification::VerificationResponse.new(
          to_mobile_no: to_mobile_no,
          verification_code: verification_code,
          status: status,
          error_message: error_message
        )
      end

      def async_response
        @async_response ||= AsyncResponseRequest::AsyncResponse.new(
          processing_status: :completed,
          response_type: :json,
          response_data: {}
        )
      end

      def serialized_result(verification_response)
        ::MobileNumberVerificationSerializer.new.serialize(verification_response)
      end
    end
  end
end
