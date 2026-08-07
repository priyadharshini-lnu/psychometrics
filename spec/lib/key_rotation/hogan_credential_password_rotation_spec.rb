# frozen_string_literal: true

require 'rails_helper'
# HoganCredential uses attr_encrypted with aes-256-gcm — same as KeyRotation::AttrEncryptedCipher.
# HoganCredential uses attr_encrypted with aes-256-gcm (attr_encrypted default).
RSpec.describe 'KeyRotation rotate_hogan_encrypted_key' do
  # old_key is the current test HOGAN_ENCRYPTED_KEY
  let(:old_key_base64) { Settings.secrets.hogan.encrypted_key.to_s }
  let(:new_key_base64) { SecureRandom.base64(32) }
  let(:old_key)        { Base64.decode64(old_key_base64) }
  let(:new_key)        { Base64.decode64(new_key_base64) }

  # Create a HoganCredential using the normal flow — attr_encrypted encrypts
  # password with the current Settings.secrets.hogan.encrypted_key.
  let!(:hogan_credential) do
    create(:hogan_credential, membership: create(:membership))
  end

  # Capture the plaintext before any rotation.
  let(:original_password) { hogan_credential.password }

  def rotate
    HoganCredential.where(id: hogan_credential.id).find_in_batches(batch_size: 200) do |batch|
      rows = []
      batch.each do |record|
        next if record.encrypted_password_iv.blank?

        plaintext = begin
          KeyRotation::AttrEncryptedCipher.decrypt(
            record.encrypted_password, record.encrypted_password_iv, old_key
          )
        rescue OpenSSL::Cipher::CipherError
          # Already encrypted with new key or unrecoverable — skip
          next
        end
        next if plaintext.nil?

        new_encrypted = KeyRotation::AttrEncryptedCipher.encrypt(plaintext, new_key)
        record.encrypted_password    = new_encrypted[:value]
        record.encrypted_password_iv = new_encrypted[:iv]
        rows << record
      end

      unless rows.empty?
        HoganCredential.import rows,
                               on_duplicate_key_update: %i[encrypted_password encrypted_password_iv],
                               validate: false
      end
    end
  end

  describe 'KeyRotation::AttrEncryptedCipher.decrypt' do
    it 'decrypts a value that was encrypted by attr_encrypted with the current hogan key' do
      expect(original_password).to be_present
      expect(
        KeyRotation::AttrEncryptedCipher.decrypt(
          hogan_credential.encrypted_password,
          hogan_credential.encrypted_password_iv,
          old_key
        )
      ).to eq(original_password)
    end

    it 'returns nil when decrypting with the wrong key' do
      result = begin
        KeyRotation::AttrEncryptedCipher.decrypt(
          hogan_credential.encrypted_password,
          hogan_credential.encrypted_password_iv,
          Base64.decode64(SecureRandom.base64(32))
        )
      rescue OpenSSL::Cipher::CipherError
        nil
      end
      expect(result).to be_nil
    end
  end

  describe 'KeyRotation::AttrEncryptedCipher.encrypt then decrypt' do
    it 'round-trips a plaintext value correctly' do
      enc = KeyRotation::AttrEncryptedCipher.encrypt('test-password', new_key)
      expect(
        KeyRotation::AttrEncryptedCipher.decrypt(enc[:value], enc[:iv], new_key)
      ).to eq('test-password')
    end
  end

  describe 'full rotation' do
    it 'plaintext password is the same after rotation' do
      expect(original_password).to be_present

      rotate

      reloaded = HoganCredential.find(hogan_credential.id)
      expect(KeyRotation::AttrEncryptedCipher.decrypt(reloaded.encrypted_password, reloaded.encrypted_password_iv,
                                                      Base64.decode64(new_key_base64))).
        to eq(original_password)
    end

    it 'changes the ciphertext stored in the database' do
      old_ciphertext = hogan_credential.encrypted_password
      rotate
      expect(HoganCredential.find(hogan_credential.id).encrypted_password).not_to eq(old_ciphertext)
    end

    it 'password is no longer readable with the old key after rotation' do
      rotate
      reloaded = HoganCredential.find(hogan_credential.id)
      expect(KeyRotation::AttrEncryptedCipher.decrypt(reloaded.encrypted_password, reloaded.encrypted_password_iv,
                                                      Base64.decode64(old_key_base64))).to be_nil
    end
  end

  describe 'blank IV handling' do
    before { hogan_credential.update_columns(encrypted_password_iv: '') }

    it 'skips the record — does not change the ciphertext' do
      original_ciphertext = hogan_credential.encrypted_password
      rotate
      expect(HoganCredential.find(hogan_credential.id).encrypted_password).to eq(original_ciphertext)
    end
  end

  describe 'already-rotated record (encrypted with new key)' do
    before do
      enc = KeyRotation::AttrEncryptedCipher.encrypt(original_password, new_key)
      hogan_credential.update_columns(
        encrypted_password:    enc[:value],
        encrypted_password_iv: enc[:iv]
      )
    end

    it 'skips without corrupting the already-rotated value' do
      rotate
      reloaded = HoganCredential.find(hogan_credential.id)
      expect(KeyRotation::AttrEncryptedCipher.decrypt(reloaded.encrypted_password, reloaded.encrypted_password_iv,
                                                      Base64.decode64(new_key_base64))).
        to eq(original_password)
    end
  end
end
