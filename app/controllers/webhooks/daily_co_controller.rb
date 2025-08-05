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
        when 'recording.started'
          handle_recording_started(payload)
        when 'recording.ready-to-download'
          handle_recording_ready_to_download(payload)
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

    def handle_recording_started(payload)
      room = MeetingRoom.find_by(name: payload['room_name'])
      return Rails.logger.warn("MeetingRoom not found for name: #{payload['room_name']}") unless room

      unless MeetingRecording.exists?(external_id: payload['recording_id'])
        MeetingRecording.create!(
          meeting_room: room,
          external_id: payload['recording_id'],
          status: :started
        )
      end
    end

    def handle_recording_ready_to_download(payload)
      recording = MeetingRecording.find_by(external_id: payload['recording_id'])
      recording&.update!(
        status: payload['status'],
        s3key: payload['s3_key']
      )
    end
  end
end
