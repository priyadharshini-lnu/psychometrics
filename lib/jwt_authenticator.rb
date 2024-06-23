# frozen_string_literal: true

class JwtAuthenticator
  def self.authenticate(jwt_key)
    _, header = JWT.decode(jwt_key, nil, false)
    api_key = ApiKey.active.find_by(key: header['api_key'])

    if api_key
      secret = api_key.token
      decoded_jwt = JWT.decode(jwt_key, secret, true, { algorithm: 'HS256' })

      check_expiration(decoded_jwt[0]['exp'])

      find_user_from_subject(decoded_jwt[0]['sub'])
    end
  rescue JWT::DecodeError, JWT::VerificationError, JWT::InvalidPayload => e
    Rails.logger.error "JWT authentication failed: #{e.message}"

    nil
  end

  def self.check_expiration(exp)
    if exp.nil? || Time.zone.at(exp) > 30.minutes.from_now
      raise JWT::InvalidPayload,
            'Token has expired or is more than 30 minutes in the future'
    end
  end

  def self.find_user_from_subject(subject)
    if subject.to_s&.match?(Devise.email_regexp)
      Users::Regular.find_by(email: subject)
    else
      Users::Regular.find_by(id: subject)
    end
  end
end
