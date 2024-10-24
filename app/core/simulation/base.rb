# frozen_string_literal: true

module Simulation
  class Base < BaseCommand
    retry_on Faraday::UnauthorizedError, Faraday::ForbiddenError

    def credentials
      config[:credentials]
    end

    def config
      Settings.secrets.simulation
    end

    def client
      @client ||= Faraday.new(config[:base_api_url]) do |connection|
        connection.request :url_encoded
        connection.adapter Faraday.default_adapter
        connection.use Faraday::Response::RaiseError

        connection.headers['Accept'] = 'application/json'
        connection.headers['Content-Type'] = 'application/json'
        connection.headers['x-api-key'] = credentials[:api_key]
      end
    end
  end
end
