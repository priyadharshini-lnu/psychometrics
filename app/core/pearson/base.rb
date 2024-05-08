# frozen_string_literal: true

module Pearson
  class Base < BaseCommand
    retry_on Faraday::UnauthorizedError, Faraday::ForbiddenError

    def credentials
      config[:credentials]
    end

    def config
      Settings.secrets.pearson
    end

    def client
      token = Pearson::GetAuthToken.call!
      @client ||= Faraday.new(config[:base_api_url]) do |connection|
        connection.request :url_encoded
        connection.adapter Faraday.default_adapter
        connection.use Faraday::Response::RaiseError

        connection.headers['Accept'] = 'application/json'
        connection.headers['Content-Type'] = 'application/json'
        connection.headers['x-api-key'] = config[:api_key]
        connection.headers['Authorization'] = "Bearer #{token}"
      end
    end

    def before_retry
      Pearson::GetAuthToken.clear_token
    end
  end
end
