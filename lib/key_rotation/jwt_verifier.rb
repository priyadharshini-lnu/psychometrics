# frozen_string_literal: true

module KeyRotation
  # Decodes JWTs signed with ENCRYPTED_KEY, with fallback to PREV_ENCRYPTED_KEY
  # during a rotation window.
  class JwtVerifier
    def self.decode(jwt_token, options)
      encrypted_key_candidates.each do |encrypted_key|
        return JWT.decode(jwt_token, encrypted_key, true, options)
      rescue JWT::DecodeError, JWT::VerificationError
        next
      end
      raise JWT::VerificationError, 'No configured ENCRYPTED_KEY could verify JWT'
    end

    def self.encrypted_key_candidates
      [
        Settings.secrets.encrypted_key.to_s,
        *ENV.fetch('PREV_ENCRYPTED_KEY', '').split(',').map(&:strip)
      ].compact_blank.uniq
    end
    private_class_method :encrypted_key_candidates
  end
end
