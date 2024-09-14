# frozen_string_literal: true

module DailyCo
  class CreateRoom < Base
    def call
      name = room_name
      response = client.post do |req|
        req.url 'rooms'
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

        req.body = {
          name: name,
          privacy: 'private',
          properties: properties
        }.to_json
      end

      response_body = JSON.parse(response.body)
      broadcast :ok, { id: response_body['id'], name: name }
    end

    def room_name
      subdomain = Settings.secrets.daily_co[:subdomain]
      name = ENV.fetch('SERVER_NAME', 'dev').downcase.gsub(/[^a-z0-9-]/, '-')
      "#{name}-#{SecureRandom.alphanumeric(40 - name.size - subdomain.size)}"
    end
  end
end
