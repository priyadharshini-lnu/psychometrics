# frozen_string_literal: true

module DailyCo
  class CreateMeetingToken < BaseCommand
    private_attr_reader :meeting_room, :current_user

    ROLES = %w[owner attendee none].freeze

    def initialize(meeting_room, current_user)
      @meeting_room = meeting_room
      @current_user = current_user
    end

    def call
      role = meeting_room.get_role(current_user)
      return broadcast(:error) if invalid_role?(role)

      broadcast :ok, token(role)
    end

    private

    def invalid_role?(role)
      role == 'none' || ROLES.exclude?(role) || meeting_room.external_id.blank?
    end

    def dailyco_config
      version = meeting_room.dailyco_api_version.presence || 'v2'
      config = Settings.secrets.daily_co[version.to_sym]
      {
        api_key: config[:api_key],
        domain_id: config[:domain_id],
        subdomain: config[:subdomain]
      }
    end

    def token(role)
      config = dailyco_config

      payload = {
        r: meeting_room.name,
        o: role == 'owner',
        d: config[:domain_id],
        u: current_user.decorate.display_name,
        ud: current_user.id,
        iat: Time.now.to_i
      }

      if meeting_room.video_recording_enabled?
        payload[:er] = 'cloud'
        payload[:sr] = true
      end

      if meeting_room.video_recording_enabled? && meeting_room.transcription_enabled?
        payload[:ast] = true
        payload[:p] = { ca: 't' }
      end

      {
        token: JWT.encode(payload, config[:api_key], 'HS256'),
        url: "https://#{config[:subdomain]}.daily.co/#{meeting_room.name}",
        video_recording_enabled: meeting_room.video_recording_enabled?
      }
    end
  end
end
