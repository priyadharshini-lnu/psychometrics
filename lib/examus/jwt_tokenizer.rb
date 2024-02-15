# frozen_string_literal: true

module Examus
  class JwtTokenizer
    class << self
      def encode(payload, alg = 'HS256')
        JWT.encode payload, Settings.secrets.examus[:jwt_secret], alg
      end

      def decode(token)
        body = JWT.decode(token, Settings.secrets.examus[:jwt_secret])
        HashWithIndifferentAccess.new body
      rescue JWT::DecodeError, JWT::VerificationError => e
        raise Errors::JwtAuthError, e.message
      end
    end
  end
end
