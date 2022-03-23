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
end
