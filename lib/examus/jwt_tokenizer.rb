# frozen_string_literal: true

module Examus
  class JWTTokenizer
    class << self
      def encode(payload, alg = 'HS256')
        JWT.encode payload, Settings.examus.jwt_secret, alg
      end

      def decode(token)
        body = JWT.decode(token, Settings.examus.jwt_secret)
        HashWithIndifferentAccess.new body
      rescue JWT::DecodeError, JWT::VerificationError => e
        raise Errors::JWTAuthError, e.message
      end
    end
  end
end
