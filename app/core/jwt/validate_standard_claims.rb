# frozen_string_literal: true

module Jwt
  class ValidateStandardClaims < BaseCommand
    MAX_EXPIRY_SECONDS = 1.hour.to_i

    private_attr_reader :payload, :expected_audience, :now, :max_expiry_seconds

    def initialize(payload:, expected_audience:)
      @payload = payload
      @expected_audience = expected_audience
      @now = Time.current.to_i
      @max_expiry_seconds = MAX_EXPIRY_SECONDS
    end

    def call
      error = validate_required_and_type_claims ||
              validate_expiry_claim ||
              validate_audience_claim ||
              validate_single_use_claim
      return broadcast(:error, error) if error

      broadcast(:ok, payload)
    end

    private

    def validate_required_and_type_claims
      missing_required_claim ||
        invalid_issuer_claim ||
        invalid_iat_claim
    end

    def validate_expiry_claim
      exp = parse_expiry(payload['exp'])
      return :invalid_expiry unless exp
      return :expired_token if exp <= now
      return :expiry_too_long if exp > now + max_expiry_seconds

      nil
    end

    def validate_audience_claim
      actual_audience = normalized_audience(payload['aud'])
      expected = normalized_audience(expected_audience)

      return :invalid_audience_format unless actual_audience
      return :invalid_audience_format unless expected
      return :audience_mismatch unless expected == actual_audience

      nil
    end

    def validate_single_use_claim
      return :invalid_single_use_claim if invalid_single_use_claim?

      nil
    end

    def missing_required_claim
      return :missing_iss if payload['iss'].nil?
      return :missing_aud if payload['aud'].nil?
      return :missing_exp if payload['exp'].nil?

      nil
    end

    def invalid_issuer_claim
      return :invalid_issuer unless integer_like?(payload['iss'])

      nil
    end

    def invalid_iat_claim
      return :invalid_iat if invalid_iat?

      nil
    end

    def parse_expiry(expiry)
      Integer(expiry)
    rescue ArgumentError, TypeError
      nil
    end

    def integer_like?(value)
      !Integer(value, exception: false).nil?
    end

    def invalid_iat?
      payload.key?('iat') && !integer_like?(payload['iat'])
    end

    def invalid_single_use_claim?
      return false unless payload.key?('single_use')

      [true, false].exclude?(payload['single_use'])
    end

    def normalized_audience(value) # rubocop:disable Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
      uri = URI.parse(value.to_s)
      return nil unless allowed_schemes.include?(uri.scheme)
      return nil if uri.host.blank?
      return nil unless uri.path.blank? || uri.path == '/'
      return nil if uri.query.present? || uri.fragment.present?

      scheme = uri.scheme.downcase
      host = uri.host.downcase
      port = uri.port
      path = uri.path.to_s
      path = '/' if path.blank?
      path = path.sub(%r{/+\z}, '')
      path = '/' if path.blank?

      normalized = "#{scheme}://#{host}"
      normalized << ":#{port}" if port && port != uri.default_port
      normalized << path
      normalized
    rescue URI::InvalidURIError
      nil
    end

    def allowed_schemes
      @allowed_schemes ||= ['https', Settings.protocol.to_s].uniq.freeze
    end
  end
end
