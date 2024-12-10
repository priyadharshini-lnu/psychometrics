# frozen_string_literal: true

module OracleAnalytics
  class Base < BaseCommand
    retry_on Faraday::UnauthorizedError, Faraday::ForbiddenError

    def client
      token = OracleAnalytics::GetAuthToken.call!

      @client ||= Faraday.new(config[:base_api_url]) do |connection|
        connection.request :url_encoded
        connection.adapter Faraday.default_adapter
        connection.use Faraday::Response::RaiseError

        connection.headers['Authorization'] = "Bearer #{token}"
        connection.headers['Content-Type'] = 'application/scim+json'
      end
    end

    def config
      @config ||= Settings.oac
    end
  end
end
