# frozen_string_literal: true

module DailyCo
  class Base < BaseCommand
    BASE_URL = 'https://api.daily.co/v1/'

    def client
      api_key = Settings.secrets.daily_co[:api_key]
      @client ||= Faraday.new(BASE_URL) do |connection|
        connection.request :url_encoded
        connection.adapter Faraday.default_adapter
        connection.use Faraday::Response::RaiseError

        connection.headers['Accept'] = 'application/json'
        connection.headers['Content-Type'] = 'application/json'
        connection.headers['Authorization'] = "Bearer #{api_key}"
      end
    end
  end
end
