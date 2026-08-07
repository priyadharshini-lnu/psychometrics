# frozen_string_literal: true

module KeyRotation
  # Verifies User#encrypted_invitation_raw with fallback to PREV_SECRET_KEY_BASE
  # during a SECRET_KEY_BASE rotation window.
  class InvitationTokenVerifier
    def self.verify(encrypted_raw)
      salt = Settings.secrets.secret_token_for_generate
      secret_key_base_candidates.each do |secret_key_base|
        key = ActiveSupport::CachingKeyGenerator.
              new(ActiveSupport::KeyGenerator.new(secret_key_base, iterations: 1000)).
              generate_key(salt)
        return ActiveSupport::MessageVerifier.new(key).verify(encrypted_raw)
      rescue ActiveSupport::MessageVerifier::InvalidSignature
        next
      end
      raise ActiveSupport::MessageVerifier::InvalidSignature,
            'No configured SECRET_KEY_BASE could verify invitation token'
    end

    def self.secret_key_base_candidates
      [
        Rails.application.secret_key_base,
        *ENV.fetch('PREV_SECRET_KEY_BASE', '').split(',').map(&:strip)
      ].compact_blank.uniq
    end
    private_class_method :secret_key_base_candidates
  end
end
