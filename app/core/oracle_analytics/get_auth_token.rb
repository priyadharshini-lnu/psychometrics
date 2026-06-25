# frozen_string_literal: true

module OracleAnalytics
  class GetAuthToken < Base
    def call
      broadcast :ok, find_or_generate_token
    end

    def self.cache_key
      'oracle_analytics/v1/authentication/token'
    end

    def self.clear_token
      Rails.cache.delete_matched(::OracleAnalytics::GetAuthToken.cache_key)
    end

    private

    def find_or_generate_token
      Rails.cache.fetch(self.class.cache_key, expires_in: 55.minutes) do
        client = Faraday.new(config[:base_api_url]) do |connection|
          connection.request :url_encoded
          connection.request :authorization, :basic, secrets[:client_id], secrets[:client_secret]
          connection.adapter Faraday.default_adapter

          connection.headers['Accept'] = 'application/json'
          connection.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        end

        response = client.post('/oauth2/v1/token') do |req|
          req.body = URI.encode_www_form({ grant_type: 'client_credentials',
                                           scope: 'urn:opc:idm:__myscopes__' })
        end

        raise "Invalid response from #{self.class.name} #{response.body}" if response.status != 200

        ::JSON.parse(response.body)['access_token']
      end
    end

    def secrets
      @secrets ||= Settings.secrets.oac
    end
  end
end
