# frozen_string_literal: true

module Lti
  class FetchJwtPublicKey < BaseCommand
    attr_reader :kid, :integration

    def initialize(kid, integration = nil)
      @kid = kid
      @integration = integration
    end

    def call
      jwks_url = integration.lti_config['keyset_url']
      response = connection.get(jwks_url)

      unless response.success?
        return broadcast(:error, "Failed to fetch JWKS: HTTP #{response.status}")
      end

      jwks = response.body

      unless jwks.is_a?(Hash) && jwks['keys'].is_a?(Array)
        return broadcast(:error, 'Invalid JWKS format')
      end

      matching_key = jwks['keys'].find { |key| key['kid'] == kid }

      unless matching_key
        return broadcast(:error, 'No matching key found in JWK set')
      end

      jwk = JWT::JWK.import(matching_key)
      public_key = jwk.public_key

      broadcast(:ok, public_key)
    rescue Faraday::Error => e
      broadcast(:error, "Network error fetching JWKS: #{e.message}")
    rescue JSON::ParserError, OpenSSL::PKey::PKeyError => e
      broadcast(:error, "Invalid JWK: #{e.message}")
    end

    private

    def connection
      @connection ||= Faraday.new do |faraday|
        faraday.request :json
        faraday.response :json
        faraday.adapter Faraday.default_adapter
        faraday.options.timeout = 10
        faraday.options.open_timeout = 5
      end
    end
  end
end
