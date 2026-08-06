# frozen_string_literal: true

class JwtAuthenticator
  def self.get_user_by_jwt(jwt_token, project)
    jwt_data, header = JWT.decode(jwt_token, nil, false)
    details = jwt_data['details'] || {}

    if header['api_key']
      api_key = ApiKey.active.find_by(key: header['api_key'])
      [:api_jwt, get_user_by_client_jwt(jwt_token, api_key, project), details]
    else
      [:lighthouse_jwt, get_user_by_lighthouse_jwt(jwt_token, project), details]
    end
  rescue JWT::DecodeError, JWT::VerificationError, JWT::InvalidPayload => e
    Rails.logger.error "JWT authentication failed: #{e.message}"

    nil
  end

  def self.get_user_by_client_jwt(jwt_token, api_key, project)
    if api_key
      secret = api_key.token
      decoded_jwt = JWT.decode(jwt_token, secret, true, { algorithm: 'HS256' })
      check_expiration(decoded_jwt[0]['exp'])

      find_user_from_subject(decoded_jwt[0]['sub'], project)
    end
  rescue JWT::DecodeError, JWT::VerificationError, JWT::InvalidPayload => e
    Rails.logger.error "JWT authentication failed: #{e.message}"

    nil
  end

  def self.get_user_by_lighthouse_jwt(jwt_token, project)
    decoded_jwt = KeyRotation::JwtVerifier.decode(jwt_token,
                                                  { verify_expiration: true, algorithm: 'HS256' })
    check_expiration(decoded_jwt[0]['exp'])

    find_user_from_subject(decoded_jwt[0]['sub'], project)
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
    if subject.to_s.match?(Devise.email_regexp)
      Users::Regular.find_by(email: subject, project_id: project.id)
    else
      Users::Regular.find_by(id: subject, project_id: project.id)
    end
  end
end
