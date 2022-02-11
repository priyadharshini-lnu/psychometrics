# frozen_string_literal: true

module Iiht
  class GetAuthToken < Base
    def call
      token = find_or_generate_token
      raise "Unable to generate IIHT auth token for project with id #{project.id}" unless token

      broadcast :ok, token
    end

    def self.cache_key(project)
      "#{uniq_cache_key(project)}/authenticate/"
    end

    def self.clear_token(project)
      key = cache_key(project)
      Rails.cache.delete_matched(key)
    end

    private

    def find_or_generate_token
      Rails.cache.fetch(self.class.cache_key(project), expires_in: 55.minutes) do
        client = Faraday.new(config['base_api_url']) do |connection|
          connection.request :url_encoded
          connection.adapter Faraday.default_adapter

          connection.headers['Accept'] = 'application/json'
          connection.headers['Content-Type'] = 'application/json'
        end

        response = client.post(
          'authenticate',
          config.slice(
            'company_id', 'company_name', 'user', 'password'
          ).deep_transform_keys! { |key| key.camelize(:lower) }.to_json
        )

        ::JSON.parse(response.body).dig('token')
      end
    end
  end
end
