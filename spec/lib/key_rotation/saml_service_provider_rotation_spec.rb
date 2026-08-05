# frozen_string_literal: true

require 'rails_helper'
RSpec.describe KeyRotation::EncryptorColumnRotator, 'SamlServiceProvider' do
  let(:old_key)    { Base64.decode64(SecureRandom.base64(32)) }
  let(:new_key)    { Base64.decode64(SecureRandom.base64(32)) }
  let(:failed)     { [] }
  let(:fixed_iv)   { KeyRotation::EncryptorColumnRotator::FIXED_IV }
  let(:algorithm)  { KeyRotation::EncryptorColumnRotator::ALGORITHM }

  let(:certificate_plaintext)  { 'BEGIN CERTIFICATE fake cert content END CERTIFICATE' }
  let(:private_key_plaintext)  { 'BEGIN PRIVATE KEY fake key content END PRIVATE KEY' }

  let!(:saml_sp) do
    sp = create(:saml_service_provider)
    sp.update_columns(
      encrypted_idp_certificate: Base64.encode64(
        Encryptor.encrypt(certificate_plaintext, key: old_key, iv: fixed_iv, algorithm: algorithm)
      ),
      encrypted_idp_private_key: Base64.encode64(
        Encryptor.encrypt(private_key_plaintext, key: old_key, iv: fixed_iv, algorithm: algorithm)
      )
    )
    sp
  end

  def call_rotator
    described_class.call(
      model:   SamlServiceProvider,
      scope:   SamlServiceProvider.where(id: saml_sp.id),
      columns: %i[encrypted_idp_certificate encrypted_idp_private_key],
      old_key: old_key,
      new_key: new_key,
      failed:  failed,
      label:   'SamlServiceProvider'
    )
  end

  def decrypt_with(key, encoded_value)
    Encryptor.decrypt(Base64.decode64(encoded_value), key: key, iv: fixed_iv, algorithm: algorithm)
  end

  describe 'successful rotation' do
    it 'idp_certificate plaintext is the same after rotation' do
      call_rotator
      reloaded = SamlServiceProvider.find(saml_sp.id)
      expect(decrypt_with(new_key, reloaded.encrypted_idp_certificate)).to eq(certificate_plaintext)
    end

    it 'idp_private_key plaintext is the same after rotation' do
      call_rotator
      reloaded = SamlServiceProvider.find(saml_sp.id)
      expect(decrypt_with(new_key, reloaded.encrypted_idp_private_key)).to eq(private_key_plaintext)
    end

    it 'changes the ciphertext in the database' do
      old_cert_ciphertext = saml_sp.encrypted_idp_certificate
      call_rotator
      expect(SamlServiceProvider.find(saml_sp.id).encrypted_idp_certificate).
        not_to eq(old_cert_ciphertext)
    end

    it 'old key can no longer decrypt after rotation' do
      call_rotator
      reloaded = SamlServiceProvider.find(saml_sp.id)
      expect { decrypt_with(old_key, reloaded.encrypted_idp_certificate) }.
        to raise_error(OpenSSL::Cipher::CipherError)
    end

    it 'records no failures' do
      call_rotator
      expect(failed).to be_empty
    end
  end

  describe 'already-rotated record (encrypted with new key)' do
    before do
      saml_sp.update_columns(
        encrypted_idp_certificate: Base64.encode64(
          Encryptor.encrypt(certificate_plaintext, key: new_key, iv: fixed_iv, algorithm: algorithm)
        )
      )
    end

    it 'skips the record without failing' do
      call_rotator
      expect(failed).to be_empty
    end

    it 'does not corrupt the already-rotated ciphertext' do
      call_rotator
      reloaded = SamlServiceProvider.find(saml_sp.id)
      expect(decrypt_with(new_key, reloaded.encrypted_idp_certificate)).to eq(certificate_plaintext)
    end
  end
end
