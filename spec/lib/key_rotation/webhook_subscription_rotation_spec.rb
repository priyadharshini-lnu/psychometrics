# frozen_string_literal: true

require 'rails_helper'
RSpec.describe KeyRotation::AttrEncryptedColumnRotator,
               'WebhookSystem::Subscription (4 encrypted columns)' do
  let(:old_key) { Settings.secrets.encrypted_key.to_s }
  let(:new_key) { SecureRandom.base64(32) }
  let(:skipped) { [] }
  let(:failed)  { [] }
  let(:columns) do
    [
      { value: :encrypted_password,            iv: :encrypted_password_iv },
      { value: :encrypted_api_key,             iv: :encrypted_api_key_iv },
      { value: :encrypted_oauth_client_id,     iv: :encrypted_oauth_client_id_iv },
      { value: :encrypted_oauth_client_secret, iv: :encrypted_oauth_client_secret_iv }
    ]
  end

  let!(:subscription) do
    create(:webhook_subscription,
           project:             Project.find(create(:project).id),
           auth_type:           :oauth,
           password:            'smtp-pass',
           api_key:             'api-key-value',
           oauth_client_id:     'client-id',
           oauth_client_secret: 'client-secret',
           oauth_grant_type:    'client_credentials',
           oauth_token_url:     'https://example.com/token',
           oauth_scope:         'read')
  end

  # Capture plaintexts before rotation while the current key is still active.
  let(:original_password)            { subscription.password }
  let(:original_api_key)             { subscription.api_key }
  let(:original_oauth_client_id)     { subscription.oauth_client_id }
  let(:original_oauth_client_secret) { subscription.oauth_client_secret }

  def call_rotator
    described_class.call(
      model:   WebhookSystem::Subscription,
      scope:   WebhookSystem::Subscription.where(id: subscription.id),
      columns: columns,
      old_key: Base64.decode64(old_key),
      new_key: Base64.decode64(new_key),
      skipped: skipped,
      failed:  failed,
      label:   'WebhookSystem::Subscription'
    )
  end

  describe 'successful rotation of all four columns' do
    before do
      # Capture originals before rotation
      original_password
      original_api_key
      original_oauth_client_id
      original_oauth_client_secret
      call_rotator
    end

    let(:reloaded) { WebhookSystem::Subscription.find(subscription.id) }

    it 'password plaintext is the same after rotation' do
      expect(KeyRotation::AttrEncryptedCipher.decrypt(reloaded.encrypted_password, reloaded.encrypted_password_iv,
                                                      Base64.decode64(new_key))).
        to eq(original_password)
    end

    it 'api_key plaintext is the same after rotation' do
      expect(KeyRotation::AttrEncryptedCipher.decrypt(reloaded.encrypted_api_key, reloaded.encrypted_api_key_iv,
                                                      Base64.decode64(new_key))).
        to eq(original_api_key)
    end

    it 'oauth_client_id plaintext is the same after rotation' do
      expect(KeyRotation::AttrEncryptedCipher.decrypt(reloaded.encrypted_oauth_client_id,
                                                      reloaded.encrypted_oauth_client_id_iv, Base64.decode64(new_key))).
        to eq(original_oauth_client_id)
    end

    it 'oauth_client_secret plaintext is the same after rotation' do
      expect(
        KeyRotation::AttrEncryptedCipher.decrypt(
          reloaded.encrypted_oauth_client_secret, reloaded.encrypted_oauth_client_secret_iv, Base64.decode64(new_key)
        )
      ).to eq(original_oauth_client_secret)
    end

    it 'records no failures' do
      expect(failed).to be_empty
    end
  end

  describe 'per-column independence — blank IV on one column does not block others' do
    before do
      original_api_key
      subscription.update_columns(encrypted_password_iv: nil)
    end

    it 'skips only the blank-IV column' do
      call_rotator
      expect(skipped).to include("WebhookSystem::Subscription##{subscription.id}")
    end

    it 'still rotates api_key' do
      call_rotator
      reloaded = WebhookSystem::Subscription.find(subscription.id)
      expect(KeyRotation::AttrEncryptedCipher.decrypt(reloaded.encrypted_api_key, reloaded.encrypted_api_key_iv,
                                                      Base64.decode64(new_key))).
        to eq(original_api_key)
    end

    it 'records no failures' do
      call_rotator
      expect(failed).to be_empty
    end
  end
end
