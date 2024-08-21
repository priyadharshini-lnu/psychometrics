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
end
