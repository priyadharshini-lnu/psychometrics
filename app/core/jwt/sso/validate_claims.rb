# frozen_string_literal: true

module Jwt
  module Sso
    class ValidateClaims < BaseCommand
      REQUIRED_CLAIMS = %w[sub kid tg].freeze
      TARGETS = %w[cmp asmt].freeze

      private_attr_reader :payload, :header, :expected_audience

      def initialize(payload:, header:, expected_audience:)
        @payload = payload
        @header = header
        @expected_audience = expected_audience
      end

      def call
        return broadcast(:error, :unsupported_algorithm) unless header['alg'] == 'RS256'

        missing_claim = REQUIRED_CLAIMS.find { |claim| payload[claim].blank? }
        return broadcast(:error, :missing_claims) if missing_claim

        common_claims = ::Jwt::ValidateStandardClaims.call(
          payload: payload,
          expected_audience: expected_audience
        )
        return broadcast(:error, common_claims[:error]) if common_claims[:error]

        return broadcast(:error, :invalid_target) unless TARGETS.include?(payload['tg'])
        return broadcast(:error, :missing_campaign_id) if payload['tg_cmp_id'].blank?
        return broadcast(:error, :missing_assessment_id) if payload['tg'] == 'asmt' && payload['tg_asmt_id'].blank?

        normalized_payload = payload.merge('single_use' => payload.fetch('single_use', false))
        broadcast(:ok, normalized_payload)
      end
    end
  end
end
