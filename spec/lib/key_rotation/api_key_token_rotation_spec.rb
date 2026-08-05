# frozen_string_literal: true

require 'rails_helper'
RSpec.describe KeyRotation::AttrEncryptedColumnRotator, 'ApiKey#token' do
  # old_key is the current test ENCRYPTED_KEY — records created normally are encrypted with it.
  let(:old_key) { Settings.secrets.encrypted_key.to_s }
  let(:new_key) { SecureRandom.base64(32) }
  let(:skipped) { [] }
  let(:failed)  { [] }
  let(:columns) { [{ value: :encrypted_token, iv: :encrypted_token_iv }] }

  # Create the record using the normal flow — attr_encrypted encrypts token
  # with the current Settings.secrets.encrypted_key (the test ENCRYPTED_KEY).
  let!(:api_key) { create(:api_key, user: create(:application_user)) }

  # The plaintext as created — decrypted using the current test key.
  let(:original_token) { api_key.token }

  def call_rotator
    described_class.call(
      model:   ApiKey,
      scope:   ApiKey.where(id: api_key.id),
      columns: columns,
      old_key: Base64.decode64(old_key),
      new_key: Base64.decode64(new_key),
      skipped: skipped,
      failed:  failed,
      label:   'ApiKey'
    )
  end

  describe 'successful rotation' do
    it 'plaintext token is the same after rotation' do
      # Capture plaintext before rotation using the current key
      expect(original_token).to be_present

      call_rotator

      # Verify by decrypting the rotated ciphertext with the new key directly
      reloaded = ApiKey.find(api_key.id)
      expect(KeyRotation::AttrEncryptedCipher.decrypt(reloaded.encrypted_token, reloaded.encrypted_token_iv,
                                                      Base64.decode64(new_key))).
        to eq(original_token)
    end

    it 'changes the ciphertext stored in the database' do
      old_ciphertext = api_key.encrypted_token
      call_rotator
      expect(ApiKey.find(api_key.id).encrypted_token).not_to eq(old_ciphertext)
    end

    it 'token is no longer readable with the old key after rotation' do
      call_rotator
      reloaded = ApiKey.find(api_key.id)
      expect(KeyRotation::AttrEncryptedCipher.decrypt(reloaded.encrypted_token, reloaded.encrypted_token_iv,
                                                      Base64.decode64(old_key))).to be_nil
    end

    it 'records no failures' do
      call_rotator
      expect(failed).to be_empty
    end

    it 'records nothing as skipped' do
      call_rotator
      expect(skipped).to be_empty
    end
  end

  describe 'blank IV handling' do
    before { api_key.update_columns(encrypted_token_iv: nil) }

    it 'does not fail the record' do
      call_rotator
      expect(failed).to be_empty
    end

    it 'adds the record to the skipped list' do
      call_rotator
      expect(skipped).to include("ApiKey##{api_key.id}")
    end

    it 'does not change the ciphertext' do
      original_ciphertext = api_key.encrypted_token
      call_rotator
      expect(ApiKey.find(api_key.id).encrypted_token).to eq(original_ciphertext)
    end
  end
end
