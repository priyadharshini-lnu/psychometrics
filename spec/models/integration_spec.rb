# frozen_string_literal: true

require 'rails_helper'

describe Integration, type: :model do
  describe '#iiht_config' do
    it 'returns config with decrypted password' do
      password = 'password@123'
      encrypted_password = Base64.encode64(Encryptor.encrypt(password))
      integration = create(:integration, config: { password: encrypted_password })

      expect(integration.iiht_config['password']).to eq(password)
    end
  end

  describe '#mettl_config' do
    it 'returns config with decrypted public and private keys' do
      public_key = 'public_key_sample'
      private_key = 'private_key_sample'
      encrypted_public_key = Base64.encode64(Encryptor.encrypt(public_key))
      encrypted_private_key = Base64.encode64(Encryptor.encrypt(private_key))
      integration = create(:integration, name: :mettl,
                           config: { 'public_key' => encrypted_public_key, 'private_key' => encrypted_private_key })

      decrypted_config = integration.mettl_config

      expect(decrypted_config['public_key']).to eq(public_key)
      expect(decrypted_config['private_key']).to eq(private_key)
    end
  end

  describe 'update_mettl_catalog' do
    it 'enqueues Mettl::FetchAssessmentsJob when creating a mettl integration' do
      expect(Mettl::FetchAssessmentsJob).to receive(:perform_later)

      create(:integration, :mettl_integration)
    end

    it 'enqueues Mettl::FetchAssessmentsJob when updating a mettl integration' do
      mettl_integration = create(:integration, :mettl_integration)

      expect(Mettl::FetchAssessmentsJob).to receive(:perform_later)

      mettl_integration.update!(name: 'mettl')
    end

    it 'does not enqueue Mettl::FetchAssessmentsJob for non-mettl assessment' do
      non_mettl_integration = create(:integration, :hogan_integration)

      expect(Mettl::FetchAssessmentsJob).not_to receive(:perform_later)

      non_mettl_integration.update!(name: 'hogan')
    end
  end
end
