# frozen_string_literal: true

module Jwt
  class ResolvePublicKey < BaseCommand
    private_attr_reader :token

    def initialize(token:)
      @token = token
    end

    def call
      payload, header = decode_unverified
      return broadcast(:error, :invalid_token) unless payload && header

      key_id = Integer(header['kid'], exception: false)
      return broadcast(:error, :invalid_key_id) if key_id.nil?

      application = ::Jwt::ResolveApplication.call!(token: token)
      return broadcast(:error, :invalid_application) unless application

      public_key = application&.public_keys&.active&.find_by(key_id: key_id.to_i)
      return broadcast(:error, :invalid_public_key) unless public_key

      broadcast(:ok, application: application, public_key: public_key)
    end

    private

    def decode_unverified
      JWT.decode(token, nil, false)
    rescue JWT::DecodeError
      nil
    end
  end
end
