# frozen_string_literal: true

module DailyCo
  class CreateRoom < Base
    ROOM_NAME_MAX_LENGTH = 128

    private_attr_reader :meeting_room

    def initialize(meeting_room)
      @meeting_room = meeting_room
    end

    def call
      name = room_name
      response = client.post do |req|
        req.url 'rooms'
        req.body = build_request_body(name)
      end

      response_body = JSON.parse(response.body)
      broadcast :ok, { id: response_body['id'], name: name }
    end

    def room_name
      name = ENV.fetch('SERVER_NAME', 'dev').downcase.gsub(/[^a-z0-9-]/, '-')
      meeting_room_name = meeting_room.meeting_room_name.downcase.tr(' ', '-').tr(':', '-').delete(',').gsub(
        /[^A-Za-z0-9_-]/, ''
      )
      base = "#{name}-#{meeting_room_name}"
      random_length = [20, ROOM_NAME_MAX_LENGTH - base.size].min
      "#{base}-#{SecureRandom.alphanumeric(random_length)}"
    end

    def build_request_body(name)
      properties = {
        enable_people_ui: true,
        enable_pip_ui: true,
        enable_emoji_reactions: true,
        enable_hand_raising: true,
        enable_prejoin_ui: true,
        enable_noise_cancellation_ui: true,
        enable_breakout_rooms: true,
        enable_screenshare: true,
        enable_chat: true,
        enable_advanced_chat: true,
        geo: 'eu-central-1'
      }

      unless Settings.features.disable_meeting_recording
        properties[:recordings_bucket] = {
          bucket_name: Settings.secrets.s3_compatible_storage[:dailyco_bucket],
          bucket_region: Settings.secrets.s3_compatible_storage[:region],
          assume_role_arn: Settings.secrets.daily_co[:assume_role_arn],
          allow_api_access: false
        }
        properties[:recordings_template] = '{domain_name}/{room_name}/{recording_id}/{epoch_time}.mp4'
      end

      {
        name: name,
        privacy: 'private',
        properties: properties
      }.to_json
    end
  end
end
