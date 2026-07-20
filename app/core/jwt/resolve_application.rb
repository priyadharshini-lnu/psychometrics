# frozen_string_literal: true

module Jwt
  class ResolveApplication < BaseCommand
    private_attr_reader :token

    def initialize(token:)
      @token = token
    end

    def call
      payload, header = decode_unverified
      return broadcast(:error, :invalid_token) unless payload && header

      issuer = payload['iss']
      return broadcast(:error, :invalid_issuer) if issuer.blank?

      key_id = Integer(header['kid'], exception: false)
      return broadcast(:error, :invalid_key_id) if key_id.nil?

      application = find_application_by_key_id(key_id)
      return broadcast(:error, :invalid_application) unless application

      return broadcast(:error, :invalid_issuer) unless application.id.to_s == issuer.to_s

      broadcast :ok, application
    end

    private

    def decode_unverified
      JWT.decode(token, nil, false)
    rescue JWT::DecodeError
      nil
    end

    def find_application_by_key_id(key_id)
      Users::Application.active.joins(:public_keys).find_by(public_keys: { key_id: key_id, disabled: false })
    end
  end
end
