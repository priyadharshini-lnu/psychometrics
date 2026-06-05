# frozen_string_literal: true

module Microsite
  class Base < BaseCommand
    retry_on Faraday::UnauthorizedError, Faraday::ForbiddenError

    attr_reader :project

    def initialize(project)
      @project = project
    end

    def config
      @config ||= project.microsite_config
    end

    def client
      @client ||= Faraday.new do |connection|
        connection.request :json
        connection.response :json
        connection.adapter Faraday.default_adapter

        connection.headers['Accept'] = 'application/json'
        connection.headers['Content-Type'] = 'application/json'
        connection.headers['x-api-key'] = api_key
      end
    end

    def base_url
      (config['base_url'] || Settings.microsite.base_api_url).to_s.chomp('/')
    end

    def api_key
      config['api_key']
    end
  end
end
