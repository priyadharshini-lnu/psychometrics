# frozen_string_literal: true

module Pearson
  class GetAuthToken < Base
    def call
      broadcast :ok, find_or_generate_token
    end

    def self.cache_key
      'pearson/v1/authentication/token'
    end

    def self.clear_token
      Rails.cache.delete_matched(::Pearson::GetAuthToken.cache_key)
    end

    private

    def find_or_generate_token
      Rails.cache.fetch(self.class.cache_key, expires_in: 55.minutes) do
        client = Faraday.new(config[:base_api_url]) do |connection|
          connection.request :url_encoded
          connection.adapter Faraday.default_adapter

          connection.headers['Accept'] = 'application/json'
          connection.headers['Content-Type'] = 'application/x-www-form-urlencoded'
          connection.headers['x-api-key'] = config[:api_key]
        end

        response = client.post(
          Addressable::URI.encode('v1/authentication/token'),
          URI.encode_www_form(username: credentials[:user_name], password: credentials[:password])
        )

        raise "Invalid response from #{self.class.name} #{response.body}" if response.status != 200

        ::JSON.parse(response.body).dig('data', 'accessToken')
      end
    end
  end
end
