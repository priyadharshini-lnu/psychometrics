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
        d: Rails.application.secrets.daily_co[:domain_id],
        u: current_user.decorate.display_name,
        ud: current_user.id,
        iat: Time.now.to_i
      }
      {
        token: JWT.encode(payload, Rails.application.secrets.daily_co[:api_key], 'HS256'),
        url: "https://#{Rails.application.secrets.daily_co[:subdomain]}.daily.co/#{meeting_room.name}"
      }
    end
  end
end
