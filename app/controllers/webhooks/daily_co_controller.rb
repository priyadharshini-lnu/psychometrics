# frozen_string_literal: true

module Webhooks
  class DailyCoController < ActionController::Base
    skip_before_action :verify_authenticity_token
    before_action :verify_daily_co_basic_auth

    def recordings
      response = parse_json_payload
      return head :unprocessable_entity unless response

      event_type = response['type']
      payload = response['payload']

      case event_type
        when 'transcript.started'
          DailyCo::TranscriptStartedEvent.process(payload)
        when 'transcript.ready-to-download'
          DailyCo::TranscriptReadyToDownloadEvent.process(payload)
        when 'recording.ready-to-download'
          DailyCo::RecordingReadyToDownloadEvent.process(payload)
      end

      head :ok
    end

    private

    def verify_daily_co_basic_auth
      auth_header = request.headers['Authorization']
      jwt_token = auth_header.to_s.sub(/^Basic\s+/i, '')
      begin
        JWT.decode(jwt_token, Settings.secrets.webhook_jwt_secret, true, algorithm: 'HS256')
      rescue JWT::DecodeError, JWT::ExpiredSignature => e
        Rails.logger.error("JWT Error: #{e.message}")
        head :unauthorized
      end
    end

    def parse_json_payload
      JSON.parse(request.raw_post)
    rescue JSON::ParserError => e
      Rails.logger.error("Invalid JSON payload received: #{e.message}")
      nil
    end
  end
end
