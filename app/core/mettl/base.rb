# frozen_string_literal: true

module Mettl
  class Base < BaseCommand
    retry_on Faraday::UnauthorizedError, Faraday::ForbiddenError

    attr_reader :project

    def initialize(project)
      @project = project
    end

    def config
      project.mettl_config
    end

    def client
      @client ||= Faraday.new do |connection|
        connection.request :url_encoded
        connection.adapter Faraday.default_adapter
        connection.use Faraday::Response::RaiseError

        connection.headers['Accept'] = 'application/json'
        connection.headers['Content-Type'] = 'application/json'
      end
    end

    def http_method
      raise NotImplementedError
    end

    def api_endpoint
      raise NotImplementedError
    end

    def public_key
      config['public_key']
    end
  end
end
