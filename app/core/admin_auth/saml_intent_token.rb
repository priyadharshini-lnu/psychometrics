# frozen_string_literal: true

module AdminAuth
  class SamlIntentToken
    SECRET = -> { Settings.secrets.encrypted_key.to_s }
    ALGORITHM = 'HS256'
    DEFAULT_EXPIRY = 5.minutes

    Result = Struct.new(:email, :return_url, keyword_init: true)

    class << self
      def encode(email:, return_url: nil, expiry: DEFAULT_EXPIRY)
        payload = {
          email: email,
          exp: expiry.from_now.to_i
        }
        payload[:return_url] = return_url if return_url.present?

        JWT.encode(payload, SECRET.call, ALGORITHM)
      end

      def decode(token)
        return nil if token.blank?

        payload, = JWT.decode(token, SECRET.call, true, algorithms: [ALGORITHM])
        Result.new(
          email: payload['email'],
          return_url: payload['return_url']
        )
      rescue JWT::DecodeError
        nil
      end

      def email_matches?(token, user_email)
        return true if token.blank?

        result = decode(token)
        return true if result.nil?

        result.email.casecmp?(user_email)
      end
    end
  end
end
