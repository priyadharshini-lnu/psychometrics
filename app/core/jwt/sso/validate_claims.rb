# frozen_string_literal: true

module Jwt
  module Sso
    class ValidateClaims < BaseCommand
      REQUIRED_CLAIMS = %w[sub].freeze
      TARGETS = %w[cmp asmt].freeze

      private_attr_reader :payload, :header, :expected_audience, :application

      def initialize(payload:, header:, expected_audience:, application:)
        @payload = payload
        @header = header
        @expected_audience = expected_audience
        @application = application
      end

      def call
        return broadcast(:error, :unsupported_algorithm) unless header['alg'] == 'RS256'

        missing_claim = REQUIRED_CLAIMS.find { |claim| payload[claim].blank? }
        return broadcast(:error, :missing_claims) if missing_claim

        return broadcast(:error, :missing_jti) if payload['single_use'] == true && payload['jti'].blank?

        common_claims = ::Jwt::ValidateStandardClaims.call(
          payload: payload,
          expected_audience: expected_audience
        )
        return broadcast(:error, common_claims[:error]) if common_claims[:error]

        target_claims = validate_target_claims
        return broadcast(:error, target_claims[:error]) if target_claims[:error]

        normalized_payload = payload.merge('single_use' => payload.fetch('single_use', false))
        broadcast(:ok, normalized_payload)
      end

      private

      def validate_target_claims
        return { error: :missing_target } if payload['tg'].blank? && payload['ret_url'].present?

        if payload['tg'].present?
          return { error: :invalid_target } unless TARGETS.include?(payload['tg'])
          return { error: :missing_campaign_id } if payload['tg_cmp_id'].blank?

          campaign = Campaign.find_by(id: payload['tg_cmp_id'])
          return { error: :invalid_campaign } unless campaign
          return { error: :invalid_campaign_tenant } unless campaign.tenant_id == application.tenant_id

          return { error: :missing_assessment_id } if payload['tg'] == 'asmt' && payload['tg_asmt_id'].blank?
        end

        {}
      end
    end
  end
end
