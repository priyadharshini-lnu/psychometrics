# frozen_string_literal: true

module Api
  module V1
    module Jwt
      class ResolveBearerTokenUser < BaseCommand
        SUPPORTED_ALGORITHM = 'RS256'
        TOKEN_SEGMENT_COUNT = 3

        private_attr_reader :token

        def initialize(token:)
          @token = token
        end

        def call
          unverified_header, _unverified_payload = decode_unverified_token_parts
          algorithm_error = validate_algorithm(unverified_header)
          return broadcast(:error, algorithm_error) if algorithm_error

          signing_key_result = ::Jwt::ResolvePublicKey.call(token: token)
          return broadcast(:error, :invalid_signing_key) unless signing_key_result[:ok]

          signing_key_data = signing_key_result[:ok]
          return broadcast(:error, :invalid_signing_key) unless signing_key_data[:public_key]

          verified = decode_verified(signing_key_data[:public_key])
          return broadcast(:error, verified[:error]) if verified[:error]

          standard_claims = validate_standard_claims(
            verified[:ok][:payload],
            signing_key_data[:application]
          )
          return broadcast(:error, standard_claims[:error]) if standard_claims[:error]

          replay_error = enforce_single_use_jti_guard(verified[:ok][:payload])
          return broadcast(:error, replay_error) if replay_error

          broadcast :ok, signing_key_data[:application]
        rescue ::JWT::DecodeError, JSON::ParserError, ArgumentError
          broadcast(:error, :invalid_bearer_token)
        end

        private

        def decode_unverified_token_parts
          parts = token_parts

          [
            decode_segment(parts[0]),
            decode_segment(parts[1])
          ]
        end

        def token_parts
          parts = token.to_s.split('.')
          raise ArgumentError, 'invalid bearer token format' unless parts.size == TOKEN_SEGMENT_COUNT

          parts
        end

        def decode_segment(segment)
          decoded = Base64.urlsafe_decode64(add_base64_padding(segment))
          JSON.parse(decoded)
        end

        def add_base64_padding(value)
          padding = (4 - (value.length % 4)) % 4
          value + ('=' * padding)
        end

        def validate_algorithm(header)
          return :missing_alg if header['alg'].blank?
          return :unsupported_algorithm unless header['alg'] == SUPPORTED_ALGORITHM

          nil
        end

        def decode_verified(public_key_record)
          result = ::Jwt::DecodeAndVerifyToken.call(token: token, public_key: public_key_record)
          return { error: :invalid_bearer_token_signature } unless result[:ok]

          { ok: { payload: result[:ok][:payload], header: result[:ok][:header] } }
        end

        def validate_standard_claims(payload, application)
          audience = ::Jwt::BuildAudience.call!(application: application)
          return { error: :invalid_audience } if audience.blank?

          ::Jwt::ValidateStandardClaims.call(
            payload: payload,
            expected_audience: audience
          )
        end

        def enforce_single_use_jti_guard(payload)
          return nil unless payload['single_use'] == true

          replay_result = ::Jwt::SingleUse::SingleUseJtiGuard.call(
            token_type: :api_v1,
            issuer: payload['iss'],
            jti: payload['jti'],
            exp: payload['exp'],
            single_use: payload['single_use']
          )

          return nil if replay_result[:ok]

          replay_reason = replay_result.dig(:replayed, :reason)
          replay_reason == :expired ? :token_expired : :token_replayed
        end
      end
    end
  end
end
