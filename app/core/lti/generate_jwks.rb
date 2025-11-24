# frozen_string_literal: true

module Lti
  class GenerateJwks < BaseCommand
    def call
      result_data = jwks_data
      broadcast(:ok, result_data)
      { ok: result_data }
    rescue StandardError => e
      broadcast(:error, e.message)
      { error: e.message }
    end

    private

    def jwks_data
      Rails.cache.fetch('lti_jwks_data', expires_in: 1.hour) do
        jwks_set.export
      end
    end

    def jwks_set
      @jwks_set ||= JWT::JWK::Set.new(jwk)
    end

    def jwk
      @jwk ||= JWT::JWK.new(private_key, jwk_params)
    end

    def jwk_params
      { use: 'sig', alg: 'RS256', kid: key_id }
    end

    def private_key
      @private_key ||= OpenSSL::PKey::RSA.new(lti_private_key_content)
    end

    def lti_private_key_content
      private_key = ENV.fetch('LTI_PRIVATE_KEY', '')
      raise StandardError, 'LTI private key not configured' if private_key.blank?

      private_key
    end

    def key_id
      @key_id ||= generated_key_id
    end

    def generated_key_id
      Digest::SHA256.hexdigest(private_key.to_s)[0, 22]
    end
  end
end
