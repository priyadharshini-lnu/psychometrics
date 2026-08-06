# frozen_string_literal: true

module KeyRotation
  # Shared cipher helpers for aes-256-gcm (attr_encrypted default).
  # Used by rotators and specs to encrypt/decrypt without duplicating cipher logic.
  module AttrEncryptedCipher
    ALGORITHM = 'aes-256-gcm'

    def self.decrypt(encrypted_value, iv_value, key)
      return nil if encrypted_value.blank?

      Encryptor.decrypt(
        Base64.decode64(encrypted_value),
        key:       key,
        iv:        Base64.decode64(iv_value.to_s),
        algorithm: ALGORITHM
      )
    rescue OpenSSL::Cipher::CipherError
      nil
    end

    def self.encrypt(plaintext, key)
      iv              = SecureRandom.random_bytes(OpenSSL::Cipher.new(ALGORITHM).iv_len)
      encrypted_value = Encryptor.encrypt(plaintext, key: key, iv: iv, algorithm: ALGORITHM)
      { value: Base64.strict_encode64(encrypted_value), iv: Base64.strict_encode64(iv) }
    end
  end
end
