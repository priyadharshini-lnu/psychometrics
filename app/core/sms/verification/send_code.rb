# frozen_string_literal: true

module Sms
  module Verification
    class SendCode < AsyncResponseRequest::AsyncRequestHandler
      private_attr_reader :to_mobile_no

      def call
        @to_mobile_no = params[:mobile_number]

        verification = client.
                       verify.
                       v2.
                       services(verification_service_sid).
                       verifications.
                       create(locale: I18n.locale, to: to_mobile_no, channel: 'sms')

        async_response.response_data = build_verification_response(verification.status, nil)
        audit_success
        broadcast :ok, async_response
      rescue Twilio::REST::RestError => e
        Rails.logger.error("OTP sending failed for #{to_mobile_no}. Error code: #{e.code}, Message: #{e.message}")
        handle_errors(e.code)
        audit_failure(e.message&.strip)
      end

      private

      def client
        @client ||= Sms::TwilioClient.get
      end

      def verification_service_sid
        Settings.secrets.twilio[:verification_service_sid]
      end

      def handle_errors(status_code)
        async_response.response_data = case status_code
                                         when 20_429
                                           build_verification_response(
                                             'error',
                                             I18n.t('auth.verify_mobile_number.error.max_attempts_reached')
                                           )
                                         when 60_200
                                           build_verification_response(
                                             'error',
                                             I18n.t('auth.verify_mobile_number.error.invalid_number')
                                           )
                                         when 60_410
                                           build_verification_response(
                                             'error',
                                             I18n.t('auth.verify_mobile_number.error.blocked')
                                           )
                                         else

                                           build_verification_response(
                                             'error', I18n.t('common.errors.something_wrong')
                                           )
                                       end

        broadcast(:invalid, async_response)
      end

      def async_response
        @async_response ||= AsyncResponseRequest::AsyncResponse.new(
          processing_status: :completed,
          response_type: :json,
          response_data: {}
        )
      end

      def build_verification_response(status, error_message)
        VerificationResponse.new(
          error_message: error_message,
          status: status,
          to_mobile_no: to_mobile_no,
          verification_code: nil
        )
      end

      def audit_failure(error_message)
        AuditLogModule.audit!(
          :send_verification_code,
          nil,
          project: context[:project],
          payload: params,
          outcome: :failed,
          failure_reason: error_message
        )
      end

      def audit_success
        AuditLogModule.audit!(
          :send_verification_code,
          nil,
          project: context[:project],
          payload: params
        )
      end
    end
  end
end
