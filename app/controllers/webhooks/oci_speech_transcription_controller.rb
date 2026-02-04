# frozen_string_literal: true

module Webhooks
  class OciSpeechTranscriptionController < ActionController::Base
    skip_before_action :verify_authenticity_token
    before_action :verify_transcription_auth

    def create
      status = OciSpeech::EventProcessor.call!(webhook_params)
      head status
    end

    private

    def webhook_params
      params.permit(
        :eventType,
        :cloudEventsVersion,
        :eventTypeVersion,
        :source,
        :eventTime,
        :contentType,
        :eventID,
        extensions: [:compartmentId],
        data: [
          :compartmentId,
          :compartmentName,
          :resourceName,
          :resourceId,
          :availabilityDomain,
          {
            freeformTags: %i[record_id record_type auth_token],
            definedTags: { 'Oracle-Tags': %i[CreatedBy CreatedOn] },
            additionalDetails: {}
          }
        ]
      )
    end

    def verify_transcription_auth
      jwt_token = ::OciSpeech::WebhookParser.auth_token(webhook_params)

      begin
        JWT.decode(jwt_token, Settings.secrets.webhook_jwt_secret, true, algorithm: 'HS256')
      rescue JWT::DecodeError, JWT::ExpiredSignature => e
        Rails.logger.error("JWT Error: #{e.message}")
        head :unauthorized
      end
    end
  end
end
