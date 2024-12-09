# frozen_string_literal: true

class JwtAuthenticator
  def self.get_user_by_client_jwt(jwt_key, project)
    _, header = JWT.decode(jwt_key, nil, false)

    api_key = ApiKey.active.find_by(key: header['api_key'])

    if api_key
      secret = api_key.token
      decoded_jwt = JWT.decode(jwt_key, secret, true, { algorithm: 'HS256' })

      check_expiration(decoded_jwt[0]['exp'])

      find_user_from_subject(decoded_jwt[0]['sub'], project)
    end
  rescue JWT::DecodeError, JWT::VerificationError, JWT::InvalidPayload => e
    Rails.logger.error "JWT authentication failed: #{e.message}"

    nil
  end

  def self.get_user_by_lighthouse_jwt(jwt_key, project)
    decoded_jwt = JWT.decode(jwt_key, Settings.secrets.encrypted_key.to_s, true,
                             { verify_expiration: false, algorithm: 'HS256' })

    exp = decoded_jwt[0]['exp']

    raise JWT::InvalidPayload if exp.nil?

    expired = Time.zone.at(exp) < Time.zone.now

    user = find_user_from_subject(decoded_jwt[0]['sub'], project)

    [user, expired]
  rescue JWT::DecodeError, JWT::VerificationError, JWT::InvalidPayload => e
    Rails.logger.error "JWT authentication failed: #{e.message}"

    nil
  end

  def self.check_expiration(exp, expire_time = 30.days.from_now)
    if exp.nil? || Time.zone.at(exp) > expire_time
      raise JWT::InvalidPayload,
            'Token has expired or is more than 30 days in the future'
    end
  end

  def self.find_user_from_subject(subject, project)
    if subject.to_s&.match?(Devise.email_regexp)
      Users::Regular.find_by(email: subject, project_id: project.id)
    else
      Users::Regular.find_by(id: subject, project_id: project.id)
    end
  end
end
