# frozen_string_literal: true

module Jwt
  module Sso
    class ResolveBearerToken < BaseCommand
      private_attr_reader :token

      def initialize(token:)
        @token = token
      end

      def call # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
        return broadcast(:error, :missing_token) if token.blank?

        unverified_payload, unverified_header = decode_unverified
        return broadcast(:error, :malformed_token) unless unverified_payload && unverified_header
        return broadcast(:error, :unsupported_algorithm) unless unverified_header['alg'] == 'RS256'

        application_and_key = resolve_application_and_key
        return broadcast(:error, :invalid_application_or_key) unless application_and_key

        verified = decode_verified(application_and_key[:public_key])
        return broadcast(:error, :invalid_signature) unless verified

        claims = validate_claims(verified, application_and_key[:application])
        return broadcast(:error, :invalid_claims) unless claims

        participant = resolve_participant(claims)
        return broadcast(:error, :participant_not_found) unless participant

        if participant.project.client != application_and_key[:application].tenant
          return broadcast(:error,
                           :invalid_application_or_key)
        end

        target = resolve_target_route(claims, participant)
        return broadcast(:error, :invalid_target) unless target

        return_url = validate_return_url(claims)
        return broadcast(:error, :invalid_return_url) if return_url == :invalid

        token_replayed = token_replayed?(claims)
        if token_replayed
          replay_url = build_replay_url(return_url, target[:replay_status])
          return broadcast(:token_reuse_detected, return_url: replay_url)
        end

        broadcast(:ok, {
          participant: participant,
          return_url: return_url,
          target_type: target[:target_type],
          campaign_id: target[:campaign_id],
          user_assessment_id: target[:user_assessment_id]
        })
      end

      private

      def decode_unverified
        JWT.decode(token, nil, false)
      rescue JWT::DecodeError
        nil
      end

      def resolve_application_and_key
        result = ::Jwt::ResolvePublicKey.call(token: token)

        resolved = result[:ok]
        return nil unless resolved

        resolved
      end

      def decode_verified(public_key_record)
        result = ::Jwt::DecodeAndVerifyToken.call(token: token, public_key: public_key_record.public_key)
        result[:ok]
      end

      def validate_claims(verified, application)
        audience = ::Jwt::BuildAudience.call!(application: application)
        return nil if audience.blank?

        result = ValidateClaims.call(payload: verified[:payload], header: verified[:header],
                                     expected_audience: audience)
        result[:ok]
      end

      def resolve_participant(claims)
        result = ResolveParticipant.call(subject: claims['sub'], campaign_id: claims['tg_cmp_id'])
        result[:ok]
      end

      def resolve_target_route(claims, participant)
        result = ResolveTargetRoute.call(
          target_type: claims['tg'],
          campaign_id: claims['tg_cmp_id'],
          assessment_id: claims['tg_asmt_id'],
          participant: participant
        )
        result[:ok]
      end

      def validate_return_url(claims)
        result = ValidateReturnUrl.call(return_url: claims['ret_url'])
        return result[:ok] if result.key?(:ok)

        :invalid
      end

      def token_replayed?(claims)
        result = Jwt::SingleUse::SingleUseJtiGuard.call(
          token_type: :sso,
          issuer: claims['iss'],
          jti: claims['jti'],
          exp: claims['exp'],
          single_use: claims['single_use']
        )

        result[:replayed].present?
      end

      def build_replay_url(return_url, replay_status)
        return nil if return_url.blank?

        uri = URI.parse(return_url)
        uri.query = uri.query&.gsub('ASSESSMENT_STATUS', replay_status)
        uri.path = uri.path&.gsub('ASSESSMENT_STATUS', replay_status)
        uri.fragment = uri.fragment&.gsub('ASSESSMENT_STATUS', replay_status)
        uri.to_s
      rescue URI::InvalidURIError
        nil
      end
    end
  end
end
