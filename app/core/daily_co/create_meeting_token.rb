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
      return broadcast(:error) if role == 'none' || ROLES.exclude?(role) || meeting_room.external_id.blank?

      broadcast :ok, token(role)
    end

    def token(role)
      payload = {
        r: meeting_room.name,
        o: role == 'owner',
        d: Settings.secrets.daily_co[:domain_id],
        u: current_user.decorate.display_name,
        ud: current_user.id,
        iat: Time.now.to_i
      }

      if meeting_room.video_recording_enabled?
        payload[:er] = 'cloud'
        payload[:sr] = true
      end

      {
        token: JWT.encode(payload, Settings.secrets.daily_co[:api_key], 'HS256'),
        url: "https://#{Settings.secrets.daily_co[:subdomain]}.daily.co/#{meeting_room.name}"
      }
    end
  end
end
