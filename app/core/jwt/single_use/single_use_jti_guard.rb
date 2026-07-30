# frozen_string_literal: true

module Jwt
  module SingleUse
    class SingleUseJtiGuard < BaseCommand
      SSO_CACHE_PREFIX = 'jwt_sso_single_use'
      private_attr_reader :token_type, :issuer, :jti, :exp, :single_use

      def initialize(token_type:, issuer:, jti:, exp:, single_use:)
        @token_type = token_type
        @issuer = issuer
        @jti = jti
        @exp = exp
        @single_use = single_use
      end

      def call
        return broadcast(:ok) unless single_use

        ttl = exp - Time.current.to_i
        return broadcast(:replayed, reason: :expired) if ttl <= 0

        reserved = $redis.set(cache_key, '1', nx: true, ex: ttl) # rubocop:disable Style/GlobalVars
        return broadcast(:ok) if reserved

        broadcast(:replayed, reason: :replayed)
      end

      private

      def cache_key
        "#{SSO_CACHE_PREFIX}:#{issuer}:#{jti}"
      end
    end
  end
end
