# frozen_string_literal: true

module Campaigns
  class JwtTokenizer
    class << self
      def encode(payload, alg = 'HS256')
        JWT.encode payload, Settings.secrets.campaign_join_secret_token, alg
      end

      def decode(token)
        body = JWT.decode(token, Settings.secrets.campaign_join_secret_token)
        ActiveSupport::HashWithIndifferentAccess.new body.first
      rescue JWT::ExpiredSignature
        nil
      rescue JWT::DecodeError, JWT::VerificationError => e
        raise Errors::JwtAuthError, e.message
      end
    end
  end
end
