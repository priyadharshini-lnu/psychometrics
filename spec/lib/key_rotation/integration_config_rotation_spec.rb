# frozen_string_literal: true

require 'rails_helper'
RSpec.describe KeyRotation::EncryptorIntegrationConfigRotator do
  let(:old_key)   { Base64.decode64(SecureRandom.base64(32)) }
  let(:new_key)   { Base64.decode64(SecureRandom.base64(32)) }
  let(:failed)    { [] }
  let(:fixed_iv)  { KeyRotation::EncryptorIntegrationConfigRotator::FIXED_IV }
  let(:algorithm) { KeyRotation::EncryptorIntegrationConfigRotator::ALGORITHM }

  def encrypt_value(plaintext, key)
    Base64.encode64(Encryptor.encrypt(plaintext, key: key, iv: fixed_iv, algorithm: algorithm))
  end

  describe 'mettl integration (public_key and private_key)' do
    let!(:integration) do
      create(:integration, name: 'mettl', config: {
        'api_base_url' => 'https://api.mettl.com',
        'public_key' => encrypt_value('my-public-key', old_key),
        'private_key' => encrypt_value('my-private-key', old_key)
      })
    end

    def call_rotator
      described_class.call(
        scope:       Integration.where(id: integration.id),
        config_keys: %w[public_key private_key],
        old_key:     old_key,
        new_key:     new_key,
        failed:      failed
      )
    end

    it 'public_key plaintext is the same after rotation' do
      call_rotator
      reloaded = Integration.find(integration.id)
      expect(Encryptor.decrypt(Base64.decode64(reloaded.config['public_key']), key: new_key, iv: fixed_iv,
algorithm: algorithm)).to eq('my-public-key')
    end

    it 'private_key plaintext is the same after rotation' do
      call_rotator
      reloaded = Integration.find(integration.id)
      expect(Encryptor.decrypt(Base64.decode64(reloaded.config['private_key']), key: new_key, iv: fixed_iv,
algorithm: algorithm)).to eq('my-private-key')
    end

    it 'changes the ciphertext in the database' do
      old_ciphertext = integration.config['public_key']
      call_rotator
      expect(Integration.find(integration.id).config['public_key']).not_to eq(old_ciphertext)
    end

    it 'old key can no longer decrypt after rotation' do
      call_rotator
      reloaded = Integration.find(integration.id)
      expect do
        Encryptor.decrypt(Base64.decode64(reloaded.config['public_key']), key: old_key, iv: fixed_iv,
algorithm: algorithm)
      end.
        to raise_error(OpenSSL::Cipher::CipherError)
    end

    it 'non-encrypted config keys are preserved unchanged' do
      call_rotator
      expect(Integration.find(integration.id).config['api_base_url']).to eq('https://api.mettl.com')
    end

    it 'records no failures' do
      call_rotator
      expect(failed).to be_empty
    end
  end

  describe 'iiht integration (password only)' do
    let!(:integration) do
      create(:integration, name: 'iiht', config: {
        'user' => 'admin',
        'password' => encrypt_value('secret-pass', old_key),
        'tenant_id' => '42'
      })
    end

    def call_rotator
      described_class.call(
        scope:       Integration.where(id: integration.id),
        config_keys: %w[password],
        old_key:     old_key,
        new_key:     new_key,
        failed:      failed
      )
    end

    it 'password plaintext is the same after rotation' do
      call_rotator
      reloaded = Integration.find(integration.id)
      expect(Encryptor.decrypt(Base64.decode64(reloaded.config['password']), key: new_key, iv: fixed_iv,
algorithm: algorithm)).to eq('secret-pass')
    end

    it 'records no failures' do
      call_rotator
      expect(failed).to be_empty
    end
  end

  describe 'already-rotated record (encrypted with new key)' do
    let!(:integration) do
      create(:integration, name: 'iiht', config: {
        'password' => encrypt_value('secret-pass', new_key)
      })
    end

    def call_rotator
      described_class.call(
        scope:       Integration.where(id: integration.id),
        config_keys: %w[password],
        old_key:     old_key,
        new_key:     new_key,
        failed:      failed
      )
    end

    it 'skips without failing' do
      call_rotator
      expect(failed).to be_empty
    end

    it 'does not corrupt the already-rotated value' do
      call_rotator
      reloaded = Integration.find(integration.id)
      expect(Encryptor.decrypt(Base64.decode64(reloaded.config['password']), key: new_key, iv: fixed_iv,
algorithm: algorithm)).to eq('secret-pass')
    end
  end
end
