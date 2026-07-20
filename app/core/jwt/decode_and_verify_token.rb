# frozen_string_literal: true

module Jwt
  class DecodeAndVerifyToken < BaseCommand
    private_attr_reader :token, :public_key

    def initialize(token:, public_key:)
      @token = token
      @public_key = public_key
    end

    def call
      payload, header = JWT.decode(
        token,
        rsa_key,
        true,
        algorithms: ['RS256'],
        verify_expiration: false
      )

      broadcast(:ok, payload: payload, header: header)
    rescue JWT::DecodeError, OpenSSL::PKey::PKeyError
      broadcast(:error, :invalid_token)
    end

    private

    def rsa_key
      return public_key.openssl_key if public_key.respond_to?(:openssl_key)
      return public_key if public_key.is_a?(OpenSSL::PKey::RSA)

      OpenSSL::PKey::RSA.new(public_key)
    end
  end
end
